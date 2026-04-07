module.exports = {
    name: 'hidetag',
    description: 'Tag everyone silently without showing their numbers',
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup, senderIsAdmin, isOwner, text } = context;

        if (!isGroup) return await sock.sendMessage(remoteJid, { text: "❌ Only in groups!" });
        if (!senderIsAdmin && !isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Admins can use hidetag!" });
        if (!text) return await sock.sendMessage(remoteJid, { text: "❌ Likhein kuch! Example: .hidetag Assalam O Alaikum" });

        // Group ke saare members ka data nikalein
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;
        
        // Saare members ki IDs ek array mein jama karein
        let allMembers = participants.map(p => p.id);
        
        // Message bhejein jisme text sirf wo hoga jo aapne likha hai, par mention sab honge!
        await sock.sendMessage(remoteJid, { 
            text: `📢 *𝐀𝐍𝐍𝐎𝐔𝐍𝐂𝐄𝐌𝐄𝐍𝐓*\n\n${text}`, 
            mentions: allMembers 
        });
    }
};
