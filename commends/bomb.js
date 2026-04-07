module.exports = {
    name: 'bomb',
    execute: async (sock, m, args) => {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const jid = m.key.remoteJid;
        
        // Initial bomb placement
        let msg = await sock.sendMessage(jid, { text: "🧨 *BOMB PLANTED! CLEAR THE AREA!* 🏃‍♂️💨" });
        
        const frames = [
            "🧨====* ⏳ 3",
            "🧨===*  ⏳ 2",
            "🧨==*   ⏳ 1",
            "🧨=*    🔥 IGNITING...",
            "🧨*     ⚠️ WARNING!",
            "⬜⬜⬜⬜⬜⬜⬜⬜\n⬜⬜ 💥 BOOM 💥 ⬜⬜\n⬜⬜⬜⬜⬜⬜⬜⬜", // Blinding flash
            `
          _.-^^---....,,--       
      _--                  --_  
     <      💥 KABOOM! 💥     >)
     |                         | 
      \\._                   _./  
         \`\`\`--. . , ; .--'''       
               | |   |             
            .-=||  | |=-.   
            \`-=#$%&%$#=-'   
               | ;  :|     
      _____.,-#%&$@%#&#~,._____
            `,
            "🌫️ 🌫️ 🌫️ 🌫️ 🌫️\n🌫️ _Cough_ _Cough_ 🌫️\n🌫️ 🌫️ 🌫️ 🌫️ 🌫️", // Smoke clearing
            "💀 *CHAT DESTROYED* 💀\n\n_Nobody survived._"
        ];
        
        // Loop through frames with 1 second delay
        for (let frame of frames) {
            await delay(1000);
            await sock.sendMessage(jid, { text: frame, edit: msg.key });
        }
    }
};