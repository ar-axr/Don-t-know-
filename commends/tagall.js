module.exports = {
    name: 'tagall',
    description: 'Tag everyone in the group',
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner } = context;
        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Sirf groups mein!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use this!" });

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;
        let mentions = participants.map(a => a.id);
        
        let text = `📢 *ATTENTION EVERYONE* 📢\n\n`;
        participants.forEach((p, i) => {
            text += `${i + 1}. @${p.id.split('@')[0]}\n`;
        });

        await sock.sendMessage(remoteJid, { text: text, mentions: mentions });
    }
};
