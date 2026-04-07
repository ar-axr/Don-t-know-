module.exports = {
    name: 'd',
    description: 'Delete message (Public can delete bot messages)',
    
    async execute(sock, m, args, context) {
        const { remoteJid, quoted, isOwner } = context;

        if (!quoted) {
            return await sock.sendMessage(remoteJid, { text: "❌ Please reply to a message to delete!" });
        }

        // Check if the message we are replying to is from the Bot itself
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isFromBot = (quoted.participant === botNumber || quoted.participant === sock.user.id);

        // Agar user aam public hai aur wo kisi dusre bande ka message delete kar raha hai
        if (!isOwner && !isFromBot) {
            return await sock.sendMessage(remoteJid, { text: "❌ Aap sirf Bot ke apne messages delete kar sakte hain!" });
        }

        try {
            const key = {
                remoteJid: remoteJid,
                fromMe: isFromBot,
                id: quoted.stanzaId,
                participant: quoted.participant
            };
            await sock.sendMessage(remoteJid, { delete: key });
        } catch (error) {
            await sock.sendMessage(remoteJid, { text: "❌ Failed to delete message! (Bot admin nahi hai)" });
        }
    }
};
