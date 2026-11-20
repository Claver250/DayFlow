const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../model/user');

// ---------- JWT: protects routes ----------
passport.use(
    new JwtStrategy(
        {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
        try {
            const user = await User.findByPk(payload.id);
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
        }
    )
);

// ---------- Google ----------
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const emailObj = profile.emails?.[0];
                const email = emailObj?.value?.toLowerCase();

                if (!email || !emailObj.verified) {
                    return done(null, false, { message: 'Google email not verified' });
                }

                let user = await User.findOne({ where: { googleId: profile.id } });
                if (user) return done(null, user);

                // Link Google to an existing email account (safe because Google verified the email)
                user = await User.findOne({ where: { email } });
                if (user) {
                    if (!user.emailVerified) {
                        // Someone signed up with this email but never proved they own it.
                        // Google just proved the real owner is here, so drop the unverified password.
                        user.password = null;
                        user.emailVerified = true;
                    }
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                user = await User.create({
                    name: profile.displayName || email.split('@')[0],
                    email,
                    googleId: profile.id,
                    password: null,
                    emailVerified: true, // Google already verified it
                });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

module.exports = passport;