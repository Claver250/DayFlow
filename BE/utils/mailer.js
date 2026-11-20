const nodemailer = require('nodemailer');

const VERIFY_LINK_HOURS = 24; // single source of truth for the link lifetime

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // 587 upgrades to TLS via STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// Never put user input into HTML unescaped
const escapeHtml = (s = '') =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const sendVerificationEmail = (to, name, link) => {
    const safeName = escapeHtml(name);
    return transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Verify your DayFlow email',
        text: `Hi ${name},\n\nConfirm your email by opening this link (valid for ${VERIFY_LINK_HOURS} hours):\n${link}\n\nIf you didn't sign up for DayFlow, ignore this email.`,
        html: `<p>Hi ${safeName},</p>
               <p>Confirm your email to finish setting up DayFlow:</p>
               <p><a href="${link}">Verify my email</a></p>
               <p>This link is valid for ${VERIFY_LINK_HOURS} hours. If you didn't sign up, ignore this email.</p>`,
    });
};

// Check the SMTP login once at startup, so a wrong key shows up immediately
if (process.env.SMTP_HOST) {
    transporter
        .verify()
        .then(() => console.log('📧 SMTP ready'))
        .catch((err) => console.error('📧 SMTP connection failed:', err.message));
}

module.exports = { sendVerificationEmail, VERIFY_LINK_HOURS };