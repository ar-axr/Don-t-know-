module.exports = {
    name: 'demoteprank',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        const groupMeta = await sock.groupMetadata(jid);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerNum = "923403643259@s.whatsapp.net"; // Aapka number
        
        const isBotAdmin = groupMeta.participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isBotAdmin) return await sock.sendMessage(jid, { text: "❌ Make me Admin first!" });

        // Get all admins except Bot and Owner
        let adminsToDemote = groupMeta.participants
            .filter(p => (p.admin === 'admin' || p.admin === 'superadmin') && p.id !== botId && p.id !== ownerNum)
            .map(p => p.id);

        if (adminsToDemote.length === 0) return await sock.sendMessage(jid, { text: "❌ No other admins to prank!" });

        await sock.sendMessage(jid, { text: "😈 *I am the only King now. Stripping all admins of their power!*" });

        // REAL ACTION: Demote them
        await sock.groupParticipantsUpdate(jid, adminsToDemote, "demote");
        
        await sock.sendMessage(jid, { text: "⏳ *Let them cry for 10 seconds...*" });
        
        // Wait 10 seconds
        await new Promise(res => setTimeout(res, 10000));

        // REAL ACTION: Promote them back
        await sock.groupParticipantsUpdate(jid, adminsToDemote, "promote");
        await sock.sendMessage(jid, { text: "😂 *Just a prank! Powers restored.*" });
    }
};
