import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as tasksApi from '../api/tasks';
import { useToast } from '../context/ToastContext';
import { formatDayShort, formatHour, HOURS, relativeDayName } from '../lib/dates';

export const INBOX = 'inbox';
export const slotId = (hour) => `slot-${hour}`;
export const hourFromContainer = (id) => (id === INBOX ? null : Number(String(id).slice(5)));

const isScheduled = (t) => t.scheduledDate != null && t.slotHour != null;

const byPosition = (a, b) =>
    (a.position ?? 0) - (b.position ?? 0) || String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));

/** { inbox: [ids], 'slot-6': [ids], ... 'slot-23': [ids] } for the given day, each list in display order */
export function groupTasks(tasks, date) {
    const groups = { [INBOX]: [] };
    HOURS.forEach((h) => (groups[slotId(h)] = []));

    [...tasks].sort(byPosition).forEach((t) => {
        if (!isScheduled(t)) groups[INBOX].push(t.id);
        else if (t.scheduledDate === date && groups[slotId(t.slotHour)]) groups[slotId(t.slotHour)].push(t.id);
    });
    return groups;
}

export const describeSlot = (date, hour) => {
    const day = relativeDayName(date);
    return `${formatHour(hour)} ${day ? day.toLowerCase() : formatDayShort(date)}`;
};

export default function useTasks(date) {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const latestDate = useRef(date);

  const load = useCallback(async () => {
    latestDate.current = date;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await tasksApi.fetchTasks(date);
      if (latestDate.current === date) setTasks(data); // ignore answers for a day we've left
    } catch {
      if (latestDate.current === date) setLoadError(true);
    } finally {
      if (latestDate.current === date) setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);
  const groups = useMemo(() => groupTasks(tasks, date), [tasks, date]);

  // Any failed save: tell the user and reload the true state from the server
  const fail = useCallback(() => {
    toast.show({ message: 'Couldn’t save. Check your connection.', variant: 'error', action: { label: 'Retry', onClick: load } });
    load();
  }, [toast, load]);

  const patchLocal = (id, changes) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const endPosition = (list) => list.reduce((max, id) => Math.max(max, byId[id]?.position ?? 0), -1) + 1;

  const addTask = async (title) => {
    const temp = {
      id: `temp-${Date.now()}`,
      title,
      completed: false,
      scheduledDate: null,
      slotHour: null,
      position: endPosition(groups[INBOX]),
      _temp: true,
    };
    setTasks((prev) => [...prev, temp]);
    try {
      const created = await tasksApi.createTask(title);
      setTasks((prev) => prev.map((t) => (t.id === temp.id ? created : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== temp.id));
      fail();
    }
  };

  const toggleTask = async (id) => {
    const completed = !byId[id]?.completed;
    patchLocal(id, { completed });
    try {
      await tasksApi.updateTask(id, { completed });
    } catch {
      fail();
    }
  };

  const renameTask = async (id, title) => {
    if (!title || title === byId[id]?.title) return;
    patchLocal(id, { title });
    try {
      await tasksApi.updateTask(id, { title });
    } catch {
      fail();
    }
  };

  const deleteTask = async (id) => {
    const removed = byId[id];
    if (!removed) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await tasksApi.deleteTask(id);
      toast.show({
        message: 'Task deleted',
        duration: 5000,
        action: { label: 'Undo', onClick: () => restoreTask(removed) },
      });
    } catch {
      fail();
    }
  };

  // Undo = create it again with the same details (it gets a new id)
  const restoreTask = async (old) => {
    try {
      let task = await tasksApi.createTask(old.title);
      const extra = {};
      if (old.completed) extra.completed = true;
      if (isScheduled(old)) Object.assign(extra, { scheduledDate: old.scheduledDate, slotHour: old.slotHour });
      if (Object.keys(extra).length) task = await tasksApi.updateTask(task.id, extra);
      setTasks((prev) => [...prev, task]);
    } catch {
      fail();
    }
  };

  /** Move one task to an hour on a day, or back to the inbox (hour = null). Goes to the end of that slot. */
  const scheduleTask = async (id, targetDate, hour) => {
    const changes = hour == null ? { scheduledDate: null, slotHour: null } : { scheduledDate: targetDate, slotHour: hour };
    const list = hour == null ? groups[INBOX] : targetDate === date ? groups[slotId(hour)] : [];
    patchLocal(id, { ...changes, position: endPosition(list.filter((x) => x !== id)) });
    try {
      const saved = await tasksApi.updateTask(id, changes);
      if (saved?.id) patchLocal(id, saved);
      toast.show({
        message: hour == null ? 'Moved back to your inbox' : `Scheduled for ${describeSlot(targetDate, hour)}`,
        variant: 'success',
        duration: 2500,
      });
    } catch {
      fail();
    }
  };

  /**
   * After a drag: `movedId` now sits in `toContainer`, whose full order is `orderedIds`.
   * Saves the slot change (if any), then the order.
   */
    const commitDrag = async (movedId, fromContainer, toContainer, orderedIds) => {
        const hour = hourFromContainer(toContainer);
        const slotChanges = hour == null ? { scheduledDate: null, slotHour: null } : { scheduledDate: date, slotHour: hour };
        const positions = Object.fromEntries(orderedIds.map((id, i) => [id, i]));

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === movedId) return { ...t, ...slotChanges, position: positions[t.id] };
        if (t.id in positions) return { ...t, position: positions[t.id] };
        return t;
      })
    );

    try {
      if (fromContainer !== toContainer) await tasksApi.updateTask(movedId, slotChanges);
      const realIds = orderedIds.filter((id) => !String(id).startsWith('temp-'));
      if (realIds.length > 1) await tasksApi.reorderTasks(realIds);
    } catch {
      fail();
    }
  };

  return {
    tasks,
    byId,
    groups,
    loading,
    loadError,
    reload: load,
    addTask,
    toggleTask,
    renameTask,
    deleteTask,
    scheduleTask,
    commitDrag,
  };
}
