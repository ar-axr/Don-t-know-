module.exports = {
    name: 'ping',
    description: 'Check bot connection speed',
    
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        const start = Date.now();
        await sock.sendMessage(remoteJid, { text: "🏓 Pinging..." });
        const end = Date.now();
        
        await sock.sendMessage(remoteJid, { text: `🏓 *Pong!*\n⚡ Speed: ${end - start}ms` });
    }
};
