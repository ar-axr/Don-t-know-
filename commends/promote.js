module.exports = {
    name: 'promote',
    description: 'Make member an admin (Group Only)',
    
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner, target } = context;

        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Ye command sirf groups mein chalti hai!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use this!" });
        if (!target) return await sock.sendMessage(remoteJid, { text: "❌ Please reply to a message to promote!" });

        try {
            await sock.groupParticipantsUpdate(remoteJid, [target], "promote");
            await sock.sendMessage(remoteJid, { text: "✅ Member promoted to Admin! 👑" });
        } catch (error) {
            await sock.sendMessage(remoteJid, { text: "❌ Failed to promote!" });
        }
    }
};
