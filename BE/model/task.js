const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.');
const User = require('./user');

// model/task.js
const Task = sequelize.define('Task', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    userId: { 
        type: DataTypes.UUID, 
        allowNull: false 
    }, // match your User id type
    title: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    completed: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    scheduledDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: true 
    },
    slotHour: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 6, max: 23 },
    }, // 6–23
    position: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
    }, // order within a slot
}, { indexes: [{ fields: ['userId', 'scheduledDate'] }] });

User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = Task;