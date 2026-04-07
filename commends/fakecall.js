module.exports = {
    name: 'fakecall',
    execute: async (sock, m, args) => {
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        const callMsg = `📞 *Missed Voice Call*\n\nTime: ${time}\n\n_Tap to call back._`;
        
        await sock.sendMessage(m.key.remoteJid, { 
            text: callMsg,
            contextInfo: {
                externalAdReply: {
                    title: "Incoming WhatsApp Call",
                    body: "Tap to answer or reject",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://whatsapp.com"
                }
            }
        });
    }
};
