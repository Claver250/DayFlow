const express = require('express');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new task
router.post('/create', requireAuth, taskController.createTask);

router.patch('/:id', requireAuth, taskController.updateTask);

router.get('/', requireAuth, taskController.listTasks);

router.delete('/:id', requireAuth, taskController.deleteTask);

module.exports = router;