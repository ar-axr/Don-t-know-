module.exports = {
    name: 'jumpscare',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        
        // Jumpscare / Funny image URL
        const imageUrl = "https://i.pinimg.com/736x/8f/c9/26/8fc926e84e54823812a02b667104b2b2.jpg"; 

        await sock.sendMessage(jid, { text: "👀 Sending a highly sensitive image..." });

        // REAL ACTION: Sending a View-Once Message
        await sock.sendMessage(jid, {
            image: { url: imageUrl },
            caption: "Gotcha! Pranked by AR Hacker 😂",
            viewOnce: true // This makes it a View Once image!
        });
    }
};
