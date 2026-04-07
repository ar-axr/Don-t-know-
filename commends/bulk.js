module.exports = {
    name: 'bulk',
    description: 'Send bulk messages',
    async execute(sock, m, args, context) {
        const { remoteJid, isOwner } = context;
        if (!isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Owner can use this!" });
        
        if (args.length < 2) return await sock.sendMessage(remoteJid, { text: "❌ Example: .bulk 10 Hello" });
        
        let amount = parseInt(args[0]);
        let msgText = args.slice(1).join(' ');

        if (amount > 50) return await sock.sendMessage(remoteJid, { text: "❌ Max 50 allowed at a time to prevent ban!" });

        await sock.sendMessage(remoteJid, { text: `🚀 Sending ${amount} messages...` });
        for (let i = 0; i < amount; i++) {
            await sock.sendMessage(remoteJid, { text: msgText });
        }
    }
};
