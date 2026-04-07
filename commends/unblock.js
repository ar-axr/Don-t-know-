module.exports = {
    name: 'unblock',
    description: 'Unblock a user',
    async execute(sock, m, args, context) {
        const { remoteJid, target, isOwner } = context;
        if (!isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Owner can use this!" });
        if (!target) return await sock.sendMessage(remoteJid, { text: "❌ Please reply to a user or mention them!" });
        
        await sock.updateBlockStatus(target, 'unblock');
        await sock.sendMessage(remoteJid, { text: "✅ User Unblocked Successfully!" });
    }
};
