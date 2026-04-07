module.exports = {
    name: 'readmore',
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        
        // This invisible character creates the "Read more" button
        const readMore = String.fromCharCode(8206).repeat(4001);
        
        const topText = "OMG! Have you guys seen this leaked video? 😱🔞👇";
        const bottomText = `
