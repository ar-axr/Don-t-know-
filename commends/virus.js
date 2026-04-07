module.exports = {
    name: 'virus',
    execute: async (sock, m, args) => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const jid = m.key.remoteJid;
        
        let msg = await sock.sendMessage(jid, { text: "⚠️ *WARNING: Malicious file detected!*" });
        
        const states = [
            "⏳ Downloading Ransomware...\n[██░░░░░░░░] 20%",
            "⏳ Encrypting device data...\n[█████░░░░░] 50%",
            "⏳ Bypassing Play Protect...\n[████████░░] 80%",
            "⏳ Sending data to Dark Web...\n[██████████] 100%",
            "😈 *INFECTION COMPLETE*\nAll personal data has been uploaded.\n\n_Pranked by AR Hacker Bot ☠️_"
        ];
        
        for (let state of states) {
            await delay(2000);
            await sock.sendMessage(jid, { text: state, edit: msg.key });
        }
    }
};
