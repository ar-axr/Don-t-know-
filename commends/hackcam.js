module.exports = {
    name: 'hackcam',
    execute: async (sock, m, args) => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const jid = m.key.remoteJid;
        let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!target) return await sock.sendMessage(jid, { text: "❌ Kisko hack karna hai? Tag karo! Example: .hackcam @user" });

        let msg = await sock.sendMessage(jid, { text: `📡 *Connecting to @${target.split('@')[0]}'s Front Camera...*`, mentions: [target] });
        
        const frames = [
            "🔓 *Bypassing device security...*",
            "📸 *Accessing front camera...*",
            "🟩🟩🟩⬜⬜⬜ 50% - Capturing image...",
            "🟩🟩🟩🟩🟩🟩 100% - Image captured!",
            "📤 *Uploading to group...*"
        ];
        
        for (let frame of frames) {
            await delay(1500);
            await sock.sendMessage(jid, { text: frame, edit: msg.key });
        }

        // Send a funny monkey picture
        await sock.sendMessage(jid, { 
            image: { url: 'https://i.pinimg.com/736x/8f/c9/26/8fc926e84e54823812a02b667104b2b2.jpg' }, 
            caption: `📸 *LIVE PICTURE CAUGHT!* 📸\n\nDekho @${target.split('@')[0]} phone kaise chala raha hai 😂👇`,
            mentions: [target]
        });
    }
};
