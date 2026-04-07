module.exports = {
    name: 'setname',
    description: 'Change bot profile name',
    async execute(sock, m, args, context) {
        const { remoteJid, text, isOwner } = context;
        if (!isOwner) return await sock.sendMessage(remoteJid, { text: "❌ Only Owner can use this!" });
        if (!text) return await sock.sendMessage(remoteJid, { text: "❌ Name likhein! Example: .setname AR HACKER" });

        await sock.updateProfileName(text);
        await sock.sendMessage(remoteJid, { text: `✅ Bot profile name changed to: ${text}` });
    }
};
