module.exports = {
    name: 'time',
    description: 'Check current time and date',
    
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        const now = new Date();
        const time = now.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' });
        const date = now.toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' });
        
        await sock.sendMessage(remoteJid, { text: `🕐 *Current Time:* ${time}\n📅 *Date:* ${date}\n📍 *Zone:* Asia/Karachi` });
    }
};
