module.exports = {
    name: 'fact',
    description: 'Send a random interesting fact',
    
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        const facts = [
            "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
            "Octopuses have three hearts.",
            "A day on Venus is longer than a year on Venus.",
            "The shortest war in history lasted only 38 minutes between Britain and Zanzibar.",
            "Bananas are berries, but strawberries aren't.",
            "Insan ke jism mein itna iron hota hai ke us se 3 inch ki keel (nail) banayi ja sakti hai."
        ];
        
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        await sock.sendMessage(remoteJid, { text: `🔍 *Did you know?*\n\n${randomFact}` });
    }
};
