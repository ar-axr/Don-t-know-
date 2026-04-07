module.exports = {
    name: 'hacked',
    description: 'Fake hacking animation prank',
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        // Pehla message bhejein aur uski 'key' save kar lein
        const sentMsg = await sock.sendMessage(remoteJid, { text: "⬛⬛⬛⬛⬛⬛⬛ 0%" });
        
        // Animation sequence (Har message edit hoga)
        const sequence = [
            "🟩⬛⬛⬛⬛⬛⬛ 10% - Connecting to IP...",
            "🟩🟩⬛⬛⬛⬛⬛ 20% - Bypassing Firewall...",
            "🟩🟩🟩⬛⬛⬛⬛ 40% - Decrypting Passwords...",
            "🟩🟩🟩🟩⬛⬛⬛ 60% - Stealing Chat History...",
            "🟩🟩🟩🟩🟩⬛⬛ 80% - Extracting Media Files...",
            "🟩🟩🟩🟩🟩🟩⬛ 95% - Injecting Virus...",
            "🟩🟩🟩🟩🟩🟩🟩 100% - SYSTEM COMPROMISED!",
            "☠️ *YOUR DEVICE HAS BEEN HACKED BY AR HACKER!* ☠️"
        ];

        // Har 1 second baad message edit karega
        for (let i = 0; i < sequence.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            await sock.sendMessage(remoteJid, { text: sequence[i], edit: sentMsg.key });
        }
    }
};
