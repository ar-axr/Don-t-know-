module.exports = {
    name: 'identity',
    execute: async (sock, m, args) => {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.key.participant || m.key.remoteJid;
        
        const ips = ["192.168.1.44", "10.0.0.5", "172.16.254.1", "185.12.55.101", "8.8.8.8"];
        const osList = ["Android 14", "iOS 17.2", "Windows 11", "Kali Linux", "macOS Sonoma"];
        const locations = ["Moscow, Russia", "New York, USA", "Karachi, Pakistan", "Tokyo, Japan", "Unknown Proxy"];
        const statuses = ["Compromised 🔴", "Monitored 🟡", "Hacked 💀", "Data Leaking 🌐"];
        
        const random = arr => arr[Math.floor(Math.random() * arr.length)];
        
        const info = `🕵️‍♂️ *TARGET IDENTITY EXTRACTED* 🕵️‍♂️\n\n` +
            `👤 *Target:* @${target.split('@')[0]}\n` +
            `🌐 *IP Address:* ${random(ips)}\n` +
            `📍 *Location:* ${random(locations)}\n` +
            `📱 *Device:* ${random(osList)}\n` +
            `⚠️ *System Status:* ${random(statuses)}\n\n` +
            `_Data synchronized securely._`;
            
        await sock.sendMessage(m.key.remoteJid, { text: info, mentions: [target] });
    }
};
