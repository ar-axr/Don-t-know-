module.exports = {
    name: 'joke',
    description: 'Send a random joke',
    
    async execute(sock, m, args, context) {
        const { remoteJid } = context;
        
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything! ⚛️",
            "What do you call a fake noodle? An impasta! 🍝",
            "Why did the math book look so sad? Because it had too many problems. 📘",
            "Teacher: Tariq, batao 'I am beautiful' kaunsa tense hai?\nTariq: Past tense madam, kyun ke ab aap aisi nahi rahin! 😂",
            "Dost: Yaar mainne ek aisi cheez banayi hai jisse tu deewar ke aar-paar dekh sakta hai.\nDusra Dost: Wah yaar! Kya hai wo?\nDost: Surakh (Hole)! 🤣"
        ];
        
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await sock.sendMessage(remoteJid, { text: `😄 *Joke Time:*\n\n${randomJoke}` });
    }
};
