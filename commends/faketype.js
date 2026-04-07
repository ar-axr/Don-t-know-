module.exports = {
    name: 'faketype',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const text = args.join(" ") || "This message was typed realistically! ✍️";
        
        await sock.sendPresenceUpdate('composing', jid); // Typing show karega
        
        // Typing duration based on text length (Max 8 seconds)
        const typingTime = Math.min(Math.max(text.length * 100, 2000), 8000);
        await new Promise(res => setTimeout(res, typingTime));
        
        await sock.sendPresenceUpdate('paused', jid); // Typing stop
        await sock.sendMessage(jid, { text: text });
    }
};
