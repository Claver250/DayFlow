const router = require('express').Router();
const passport = require('passport');
const auth = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/signup', authLimiter, auth.signUp);
router.post('/login', authLimiter, auth.loginUser);
router.post('/refresh', auth.refreshToken);
router.post('/logout', requireAuth, auth.logout);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback', auth.googleCallback);

router.get('/me', requireAuth, auth.getProfile);

router.post('/verify-email', authLimiter, auth.verifyEmail);
router.post('/resend-verification', authLimiter, requireAuth, auth.resendVerification);

module.exports = router;