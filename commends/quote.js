module.exports = {
    name: 'quote',
    description: 'Send a random quote',
    
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        const quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Life is what happens when you're busy making other plans. - John Lennon",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
            "Believe you can and you're halfway there. - Theodore Roosevelt",
            "Mehnat itni khamoshi se karo ke tumhari kamyabi shor macha de.",
            "Waqt sab se bada ustad hai."
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(remoteJid, { text: `💭 *Quote of the moment:*\n\n"${randomQuote}"` });
    }
};
