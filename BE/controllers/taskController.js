const Task = require('../model/task');
const { taskSchema, updateTaskSchema } = require('../validators/taskValidator');

exports.createTask = async (req, res) => {
    try {
        const { error, value } = taskSchema.validate(req.body, { stripUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const scheduledDate = value.scheduledDate ?? null;
        const slotHour = value.slotHour ?? null;

        if ((scheduledDate != null) !== (slotHour != null)) {
            return res.status(400).json({ error: 'scheduledDate and slotHour must be set together' });
        }

        // Put the new task at the end of its slot (or of the unscheduled list)
        const last = await Task.max('position', {
            where: { userId: req.user.id, scheduledDate, slotHour },
        });

        const newTask = await Task.create({
            title: value.title,
            scheduledDate,
            slotHour,
            position: (last ?? -1) + 1,
            userId: req.user.id,
        });

        return res.status(201).json(newTask);
    } catch (error) {
        console.error('createTask error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { error, value } = updateTaskSchema.validate(req.body, { stripUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const next = { ...task.toJSON(), ...value }; // Merge current task data with new values

        const hasDate = next.scheduledDate != null;  // != null catches both null and undefined
        const hasSlot = next.slotHour != null;       // 0 counts as set
        if (hasDate !== hasSlot) {
            return res.status(400).json({ error: 'scheduledDate and slotHour must be set together' });
        }

        // Moved to a different day/hour (or scheduled/unscheduled)? Put it at the end of the new slot
        const slotChanged =
            String(next.scheduledDate ?? '') !== String(task.scheduledDate ?? '') ||
            (next.slotHour ?? null) !== (task.slotHour ?? null);

        if (slotChanged) {
            const last = await Task.max('position', {
                where: {
                    userId: req.user.id,
                    scheduledDate: next.scheduledDate ?? null,
                    slotHour: next.slotHour ?? null,
                },
            });
            value.position = (last ?? -1) + 1;
        }

        await task.update(value);
        return res.status(200).json(task);
    } catch (error) {
        console.error('updateTask error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.listTasks = async (req, res) => {
    try {
        const where = { userId: req.user.id };
        if (req.query.date) where.scheduledDate = req.query.date; // optional ?date=2026-11-20

        const tasks = await Task.findAll({
            where,
            order: [
                ['scheduledDate', 'ASC NULLS FIRST'], // unscheduled tasks first
                ['slotHour', 'ASC'],
                ['position', 'ASC'],
            ],
        });
        return res.status(200).json(tasks);
    } catch (error) {
        console.error('listTasks error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        await task.destroy();
        return res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('deleteTask error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}