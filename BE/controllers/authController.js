const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../model/user');
const { userSchema, loginSchema } = require('../validators/authValidator');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, generateRefreshToken, hashToken } = require('../utils/token');
const hasMailServer = require('../utils/emailDomain');
const { issueVerification } = require('../utils/verification');

// Never send these to the client
const sanitize = (user) => {
    const { password, refreshToken, googleId, verifyTokenHash, verifyTokenExpires, ...safe } = user.toJSON();
    return safe;
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,                                   // JS can't read it
    secure: process.env.NODE_ENV === 'production',    // HTTPS only in prod
    sameSite: 'lax',                                  // first-party via the Vite / Vercel proxy
    path: '/api/v1/auth',                             // only sent to auth routes
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days, matches the JWT
};

const { maxAge, ...CLEAR_COOKIE_OPTIONS } = REFRESH_COOKIE_OPTIONS;

exports.signUp = async (req, res) => {
    try {
        const { error, value } = userSchema.validate(req.body, { stripUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, password } = value;
        const email = value.email.toLowerCase().trim();

        if (!(await hasMailServer(email))) {
            return res.status(400).json({ error: 'This email domain can’t receive mail. Check for typos.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(409).json({ error: 'Email already exists' });

        const newUser = await User.create({
            name,
            email,
            password: await hashPassword(password),
        });

        try {
            await issueVerification(newUser);
        } catch (e) {
            console.error('verification email failed:', e.message); // signup still succeeds
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: sanitize(newUser),
        });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('signUp error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { stripUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const email = value.email.toLowerCase().trim();
        const user = await User.findOne({ where: { email } });

        // Same message for unknown email, wrong password, and Google-only accounts
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await comparePassword(value.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = hashToken(refreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: sanitize(user),
        });
    } catch (err) {
        console.error('login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            const message = info?.message || 'Google login failed';
            if (!process.env.FRONTEND_URL) return res.status(401).json({ error: message });
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
        }

        try {
            const refreshToken = generateRefreshToken(user);
            user.refreshToken = hashToken(refreshToken);
            await user.save();

            res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

            // No frontend yet → show the result in the browser
            if (!process.env.FRONTEND_URL) {
                return res.status(200).json({
                    message: 'Google login successful',
                    accessToken: generateToken(user),
                    user: sanitize(user),
                });
            }

            return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
        } catch (e) {
            return next(e);
        }
    })(req, res, next);
};

exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ error: 'No refresh token' });

        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(payload.id);

        // Must match the hash saved at login. A logged-out or reused token fails here
        if (!user || user.refreshToken !== hashToken(token)) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Rotate: new refresh token every time
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = hashToken(newRefreshToken);
        await user.save();

        res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
        return res.status(200).json({ accessToken: generateToken(user) });
    } catch (err) {
        console.error('refresh error:', err.name, err.message);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        return res.status(200).json(sanitize(req.user));
    } catch (err) {
        console.error('getProfile error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Missing token' });

        const user = await User.findOne({ where: { verifyTokenHash: hashToken(token) } });
        if (!user || user.verifyTokenExpires < new Date()) {
            return res.status(400).json({ error: 'This link is invalid or has expired' });
        }

        user.emailVerified = true;
        user.verifyTokenHash = null;
        user.verifyTokenExpires = null;
        await user.save();
        return res.status(200).json({ message: 'Email verified' });
    } catch (err) {
        console.error('verifyEmail error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Route uses requireAuth so req.user exists
exports.resendVerification = async (req, res) => {
    try {
        if (req.user.emailVerified) return res.status(200).json({ message: 'Already verified' });
        await issueVerification(req.user);
        return res.status(200).json({ message: 'Verification email sent' });
    } catch (err) {
        console.error('resendVerification error:', err);
        return res.status(500).json({ error: 'Couldn’t send the verification email' });
    }
};

// Works from the cookie alone, so it also works after the access token has expired.
// Route: router.post('/logout', auth.logout);   (no requireAuth)
exports.logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await User.update({ refreshToken: null }, { where: { refreshToken: hashToken(token) } });
        }
        res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('logout error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
