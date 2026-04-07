module.exports = {
    name: 'systemui',
    execute: async (sock, m, args) => {
        const alertMsg = `⚠️ *System Error*\n\nSystem UI isn't responding.\n\n[ *CLOSE APP* ]     [ *WAIT* ]`;
        await sock.sendMessage(m.key.remoteJid, { text: alertMsg });
    }
};
