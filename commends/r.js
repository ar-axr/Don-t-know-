module.exports = {
    name: 'r',
    description: 'Remove member by typing number (Group Only)',
    
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner, text } = context;

        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Ye command sirf groups mein chalti hai!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use this!" });
        if (!text) return await sock.sendMessage(remoteJid, { text: "❌ Number likhein! Example: .r 923xxxxxxxxx" });

        let targetNum = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.groupParticipantsUpdate(remoteJid, [targetNum], "remove");
            await sock.sendMessage(remoteJid, { text: `✅ User removed successfully!` });
        } catch (error) {
            await sock.sendMessage(remoteJid, { text: `❌ Failed! (Make sure Bot is Admin)` });
        }
    }
};
