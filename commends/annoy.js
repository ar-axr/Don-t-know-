module.exports = {
    name: 'annoy',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!target) return await sock.sendMessage(jid, { text: "❌ Target do! Example: .annoy @user" });

        await sock.sendMessage(jid, { text: `🎯 *Target locked on @${target.split('@')[0]}! Initiating Spam Protocol...*`, mentions: [target] });

        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        const spamMessages = [
            "WAKE UP! 🚨",
            "Are you sleeping? 🤔",
            "Your phone is ringing! 📱",
            "Reply me bro! 😡",
            "Spam attack! 💥",
            "Still ignoring? 👀",
            "I will not stop! 😈",
            "Answer the bot! 🤖",
            "Almost done... ⏳",
            "Final hit! ☄️"
        ];

        // REAL ACTION: Send 10 separate notifications rapidly
        for (let i = 0; i < spamMessages.length; i++) {
            await delay(1000); // 1 sec delay to avoid WhatsApp ban limit
            await sock.sendMessage(jid, { 
                text: `${spamMessages[i]} @${target.split('@')[0]}`, 
                mentions: [target] 
            });
        }
        
        await sock.sendMessage(jid, { text: "✅ *Annoyance complete. Target destroyed.*" });
    }
};
