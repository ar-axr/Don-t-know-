module.exports = {
    name: 'hack',
    execute: async (sock, m, args) => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const jid = m.key.remoteJid;
        
        let msg = await sock.sendMessage(jid, { text: "💻 *Terminal initialized...*" });
        
        const steps = [
            "📡 Connecting to WhatsApp servers...",
            "🛡️ Bypassing security firewalls...",
            "🔓 Root access granted...",
            "🦠 Injecting Trojan.exe virus...",
            "📂 Extracting hidden gallery files...",
            "💰 Stealing cryptocurrency wallets...",
            "💀 *SYSTEM COMPLETELY HACKED* 💀\n\n_Just kidding! Pranked by AR Hacker Bot 🚀_"
        ];
        
        for (let step of steps) {
            await delay(1500); // 1.5 second delay
            await sock.sendMessage(jid, { text: step, edit: msg.key });
        }
    }
};
