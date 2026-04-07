module.exports = {
    name: 'demote',
    description: 'Remove admin power (Group Only)',
    
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner, target } = context;

        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Ye command sirf groups mein chalti hai!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use this!" });
        if (!target) return await sock.sendMessage(remoteJid, { text: "❌ Please reply to a message to demote!" });

        try {
            await sock.groupParticipantsUpdate(remoteJid, [target], "demote");
            await sock.sendMessage(remoteJid, { text: "✅ Admin demoted successfully!" });
        } catch (error) {
            await sock.sendMessage(remoteJid, { text: "❌ Failed to demote!" });
        }
    }
};
