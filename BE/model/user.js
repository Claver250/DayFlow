const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.');

const User = sequelize.define(
    'User',
    {
        id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        },
        name: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        },
        password: {
        type: DataTypes.STRING,
        allowNull: true, // null for Google-only accounts
        },
        googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        },
        refreshToken: {
        type: DataTypes.STRING, // stores the SHA-256 hash (64 chars), never the raw token
        allowNull: true,
        },
        emailVerified: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        },
        verifyTokenHash: { 
            type: DataTypes.STRING, 
            allowNull: true 
        },
        verifyTokenExpires: { 
            type: DataTypes.DATE, 
            allowNull: true 
        },
    },
    { timestamps: true }
    );

module.exports = User;