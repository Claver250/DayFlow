import api from './client';

// All routes match the Express backend in BE/route/taskRoute.js.
// Adjust the paths here if yours differ (e.g. PATCH /task/update/:id).

export const fetchTasks = (date) =>
    api.get('/task', { params: { date } }).then((r) => r.data); // inbox + that day

export const createTask = (title) =>
    api.post('/task/create', { title }).then((r) => r.data);

export const updateTask = (id, changes) =>
    api.patch(`/task/${id}`, changes).then((r) => r.data);

export const deleteTask = (id) => api.delete(`/task/${id}`);

export const reorderTasks = (taskIds) =>
    api.patch('/task/reorder', { taskIds }).then((r) => r.data);
