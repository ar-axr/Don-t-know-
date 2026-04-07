module.exports = {
    name: 'battery',
    execute: async (sock, m, args) => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const jid = m.key.remoteJid;
        
        let msg = await sock.sendMessage(jid, { text: "🔋 *Battery:* 100% [██████████]" });
        
        const states = [
            "🔋 *Battery:* 70%  [███████░░░]",
            "🔋 *Battery:* 40%  [████░░░░░░]",
            "🪫 *Battery:* 15%  [█░░░░░░░░░] _Warning: Low Power_",
            "🪫 *Battery:* 1%   [░░░░░░░░░░] _Shutting down..._",
            "💀 *Device Power Off*"
        ];
        
        for (let state of states) {
            await delay(1500);
            await sock.sendMessage(jid, { text: state, edit: msg.key });
        }
    }
};
