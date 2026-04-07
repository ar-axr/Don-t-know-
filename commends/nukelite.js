module.exports = {
    name: 'nukelite',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        
        if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: "❌ Groups only!" });
        
        // Admin verification
        const groupMetadata = await sock.groupMetadata(jid);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (!isAdmin && sender !== "923403643259@s.whatsapp.net") {
            return await sock.sendMessage(jid, { text: "❌ Only Admins can use this!" });
        }

        const participants = groupMetadata.participants.map(p => p.id);
        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        await sock.sendMessage(jid, { text: "🚀 *NUKE LITE INITIATED* 🚀\n_Incoming spam..._" });
        
        const emojis = ["🔥", "💀", "😹", "💥"];
        
        for (let i = 0; i < 4; i++) {
            await delay(2500); // 2.5 sec delay ban se bachne ke liye
            await sock.sendMessage(jid, { 
                text: `NUKE ATTACK ${emojis[i]} \n\n` + emojis.join(" "), 
                mentions: participants 
            });
        }
        await sock.sendMessage(jid, { text: "✅ *Nuke Lite Complete*" });
    }
};
