module.exports = {
    name: 'glitch',
    execute: async (sock, m, args) => {
        const text = args.join(" ") || "SYSTEM COMPROMISED!";
        const zalgoChars = ['̖',' ̗',' ̘',' ̙',' ̜',' ̝',' ̞',' ̟',' ̠',' ̤',' ̥',' ̦',' ̩',' ̪',' ̫',' ̬',' ̭',' ̮',' ̯',' ̰',' ̱',' ̲',' ̳',' ̹',' ̺',' ̻',' ̼',' ͅ',' ͇',' ͈',' ͉',' ͍',' ͎',' ͓',' ͔',' ͕',' ͖',' ͙',' ͚',' ̣'];
        
        let glitched = "";
        for (let i = 0; i < text.length; i++) {
            glitched += text[i];
            for(let j = 0; j < 3; j++) glitched += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
        }
        await sock.sendMessage(m.key.remoteJid, { text: glitched });
    }
};
