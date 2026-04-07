module.exports = {
    name: 'left',
    description: 'Koi bhi user bot ko group se nikalne ke liye use kar sakta hai',
    
    async execute(sock, m, args, context) {
        const { remoteJid, isGroup } = context;

        // Check if command is used in a group
        if (!isGroup) {
            return await sock.sendMessage(remoteJid, { text: "❌ Ye command sirf groups mein chalti hai!" });
        }

        // Public user reply
        await sock.sendMessage(remoteJid, { 
            text: "👋 Aapki request par main ye group chhor raha hoon taake koi issue/scam na ho. Allah Hafiz! 🚀" 
        });
        
        // 2 second baad bot kudh group leave kar dega
        setTimeout(async () => {
            try {
                await sock.groupLeave(remoteJid);
                console.log(`Bot left the group: ${remoteJid}`);
            } catch (err) {
                console.log("Group leave karne mein error:", err.message);
            }
        }, 2000);
    }
};