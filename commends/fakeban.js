module.exports = {
    name: 'fakeban',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!target) return await sock.sendMessage(jid, { text: "❌ Tag a victim! Example: .fakeban @user" });
        
        const banMessage = `⚠️ *WHATSAPP SUPPORT TEAM* ⚠️\n\n` +
            `Dear @${target.split('@')[0]},\n\n` +
            `Our automated systems have detected multiple violations of our Terms of Service originating from your account (Spam & Unauthorized API usage).\n\n` +
            `⏳ *Action:* Your account is scheduled for Permanent Deletion in exactly 5 minutes.\n\n` +
            `If you believe this is a mistake, please verify your identity immediately by clicking below:\n\n` +
            `[ 🔒 VERIFY ACCOUNT NOW ](https://wa.me/settings)\n\n` +
            `_Ticket ID: #WA-99283-X7_\n` +
            `_Meta Security Department_`;
            
        // Sending as a highly quoted system message
        await sock.sendMessage(jid, { 
            text: banMessage, 
            mentions: [target] 
        }, {
            quoted: {
                key: { fromMe: false, participant: "0@s.whatsapp.net", id: "WHATSAPP_SYSTEM" },
                message: { conversation: "SYSTEM NOTIFICATION" }
            }
        });
    }
};
