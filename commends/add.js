module.exports = {
    name: 'add',
    description: 'Add member by number (Group Only)',
    
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner, text } = context;

        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Ye command sirf groups mein chalti hai!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use this!" });
        if (!text) return await sock.sendMessage(remoteJid, { text: "❌ Please provide a number: .add 923xxxxxxxxx" });

        let num = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        try {
            await sock.groupParticipantsUpdate(remoteJid, [num], "add");
            await sock.sendMessage(remoteJid, { text: "✅ Member added successfully!" });
        } catch (error) {
            await sock.sendMessage(remoteJid, { text: "❌ Failed to add member! (Privacy issue or Bot not Admin)" });
        }
    }
};
