module.exports = {
    name: 'chaos',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        // 1. Fake Type
        await sock.sendPresenceUpdate('composing', jid);
        await delay(2000);
        await sock.sendPresenceUpdate('paused', jid);
        
        // 2. Glitch Text
        await sock.sendMessage(jid, { text: "C̴R̵I̵T̷I̴C̴A̸L̵ ̵S̷Y̵S̴T̶E̸M̶ ̵F̶A̵I̵L̷U̶R̶E̴" });
        await delay(1500);
        
        // 3. Hack Animation
        let msg = await sock.sendMessage(jid, { text: "💻 *Initiating Chaos Protocol...*" });
        await delay(1500);
        await sock.sendMessage(jid, { text: "🦠 Injecting sequence...", edit: msg.key });
        await delay(1500);
        await sock.sendMessage(jid, { text: "💀 *CHAOS UNLEASHED*", edit: msg.key });
        
        // 4. Ghost Ping (Groups)
        if (jid.endsWith('@g.us')) {
            const groupMetadata = await sock.groupMetadata(jid);
            const participants = groupMetadata.participants.map(p => p.id);
            await delay(1000);
            await sock.sendMessage(jid, { text: "👻 You can't hide...", mentions: participants });
        }
    }
};
