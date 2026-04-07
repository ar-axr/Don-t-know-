module.exports = {
    name: 'ghostping',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: "❌ This command only works in groups!" });

        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants.map(p => p.id);
        
        // Empty character combined with mentions pings everyone silently
        await sock.sendMessage(jid, { text: "👻\u200B", mentions: participants });
    }
};
