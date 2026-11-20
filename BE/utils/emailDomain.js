const dns = require('dns').promises;

// Only these mean "this domain really can't receive mail"
const NO_MAIL_CODES = ['ENOTFOUND', 'ENODATA', 'ENOTIMP', 'ESERVFAIL'];

const hasMailServer = async (email) => {
    const domain = email.split('@')[1];
    try {
        const records = await dns.resolveMx(domain);
        return records.length > 0;
    } catch (err) {
        if (NO_MAIL_CODES.includes(err.code)) return false;
        console.warn('MX lookup failed, allowing signup:', err.code);
        return true; // DNS problem on our side: don't punish the user
    }
};

module.exports = hasMailServer;