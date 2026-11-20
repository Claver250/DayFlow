const Joi = require('joi');

// Task creation validation schema
const taskSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255).required()
});

const updateTaskSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255),
    scheduledDate: Joi.date().iso().allow(null),
    slotHour: Joi.number().integer().min(6).max(23).allow(null),
    position: Joi.number().integer().optional(),
    completed: Joi.boolean()
}).min(1); // Ensure at least one field is provided for update

const dateSchema = Joi.object({
    scheduledDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});

module.exports = { taskSchema, updateTaskSchema, dateSchema };