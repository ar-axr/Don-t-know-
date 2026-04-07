module.exports = {
    name: 'link',
    description: 'Create wa.me link',
    async execute(sock, m, args, context) {
        const { remoteJid, text } = context;
        if (!text) return await sock.sendMessage(remoteJid, { text: "❌ Number likhein! Example: .link 923xxxxxxxxx" });
        
        let num = text.replace(/[^0-9]/g, '');
        await sock.sendMessage(remoteJid, { text: `🔗 *Direct WhatsApp Link:*\n\nhttps://wa.me/${num}` });
    }
};
