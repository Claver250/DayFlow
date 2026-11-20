const crypto = require('crypto');
const { hashToken } = require('./token');
const { sendVerificationEmail, VERIFY_LINK_HOURS } = require('./mailer');

exports.issueVerification = async (user) => {
    const token = crypto.randomBytes(32).toString('hex');
    user.verifyTokenHash = hashToken(token);
    user.verifyTokenExpires = new Date(Date.now() + VERIFY_LINK_HOURS * 60 * 60 * 1000);
    await user.save();

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    if (!process.env.SMTP_HOST) {
        console.log(`\n📧 Verification link for ${user.email}:\n${link}\n`);
        return;
    }

    await sendVerificationEmail(user.email, user.name, link);
};