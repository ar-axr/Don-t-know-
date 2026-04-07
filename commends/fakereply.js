module.exports = {
    name: 'fakereply',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        if (args.length < 2) return await sock.sendMessage(jid, { text: "❌ Format: .fakereply @user Fake message here" });
        
        let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return await sock.sendMessage(jid, { text: "❌ Please tag someone! Example: .fakereply @user Haha I am noob" });
        
        const fakeText = args.join(" ").replace(/@\d+/g, '').trim();
        
        const fakeQuote = {
            key: { fromMe: false, participant: target, id: "AR_FAKE_MSG_ID" },
            message: { conversation: "I am a bot 😂" } // Yeh message original message ki jagah show hoga
        };
        
        await sock.sendMessage(jid, { text: fakeText }, { quoted: fakeQuote });
    }
};
