const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = '1d';

// Generate token
const generateToken = (user) => {
    const id = user.userId;
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        SECRET_KEY,
        {expiresIn: EXPIRES_IN}
    );
};

// Verify token
const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

module.exports = {generateToken, verifyToken, generateRefreshToken, hashToken};
