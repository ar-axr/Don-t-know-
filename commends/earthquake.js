module.exports = {
    name: 'earthquake',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: "❌ Group only!" });

        const groupMeta = await sock.groupMetadata(jid);
        const originalName = groupMeta.subject;
        const delay = ms => new Promise(res => setTimeout(res, ms));

        // Admin check
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMeta.participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isBotAdmin) return await sock.sendMessage(jid, { text: "❌ Bot must be Admin for Earthquake!" });

        await sock.sendMessage(jid, { text: "🚨 *EARTHQUAKE INITIATED! HOLD YOUR PHONES!* 🚨" });

        const crazyNames = [
            "HACKED BY AR 💀", 
            "SYSTEM DESTROYED 🔥", 
            "ERROR 404 🚫", 
            "YOUR PHONE IS MINE 📱", 
            "WAKE UP! 🚨"
        ];

        // Action: Change names rapidly
        for (let name of crazyNames) {
            await sock.groupUpdateSubject(jid, name);
            await delay(1500); // 1.5 sec delay to avoid WhatsApp ban
        }

        // Action: Lock and Unlock Group
        await sock.groupSettingUpdate(jid, 'locked');
        await sock.sendMessage(jid, { text: "🔒 *GROUP LOCKED! NO ESCAPE!*" });
        await delay(2000);
        await sock.groupSettingUpdate(jid, 'unlocked');

        // Restore original
        await sock.groupUpdateSubject(jid, originalName);
        await sock.sendMessage(jid, { text: "✅ *Earthquake stopped. Group restored to normal!*" });
    }
};
