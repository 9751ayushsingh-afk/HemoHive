const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Load Locales and FAQ
const locales = require('./locales');
const faq = require('./faq.json');

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Global user state (simple in-memory for MVP, ideal is Redis/DB)
const userState = {};

async function connectToDatabase() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    return mongoose.connect(MONGODB_URI);
}

// Initialize Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above to log in to RaktBandhu!');
});

client.on('ready', () => {
    console.log('RaktBandhu is ready!');
    connectToDatabase().then(() => console.log('Connected to MongoDB'));
});

client.on('message', async (message) => {
    try {
        const chat = await message.getChat();
        // Use message.from directly to avoid getContact() bug in recent library versions
        // For groups, we might need message.author, but for 1:1 bot interaction message.from is safer
        const senderId = message.from;
        const msgBody = message.body.trim();

        // 1. Language Check
        if (!userState[senderId]) {
            userState[senderId] = { step: 'LANG_SELECT', lang: 'en' };
            await chat.sendMessage("Welcome to RaktBandhu! 🩸\n\nPlease select your language:\n1. English\n2. Hindi");
            return;
        }

        const state = userState[senderId];

        // Language Selection Handling
        if (state.step === 'LANG_SELECT') {
            if (msgBody === '1' || msgBody.toLowerCase() === 'english') {
                state.lang = 'en';
                state.step = 'MAIN_MENU';
                await chat.sendMessage(locales.en.welcome);
            } else if (msgBody === '2' || msgBody.toLowerCase() === 'hindi') {
                state.lang = 'hi';
                state.step = 'MAIN_MENU';
                await chat.sendMessage(locales.hi.welcome);
            } else {
                await chat.sendMessage("Please reply with 1 for English or 2 for Hindi.");
            }
            return;
        }

        // Locale helper
        const t = locales[state.lang];

        // 2. Command Handling
        const lowerMsg = msgBody.toLowerCase();

        // Reset/Menu
        if (lowerMsg === '!menu' || lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'namaste') {
            state.step = 'MAIN_MENU';
            await chat.sendMessage(t.welcome);
            return;
        }

        // FAQ Check
        const faqMatch = faq.find(q => lowerMsg.includes(q.keyword.toLowerCase()));
        if (faqMatch) {
            await chat.sendMessage(state.lang === 'hi' ? faqMatch.answer_hi : faqMatch.answer_en);
            return;
        }

        // Tracking
        if (lowerMsg.startsWith('!track')) {
            const trackId = lowerMsg.split(' ')[1];
            if (!trackId) {
                await chat.sendMessage(t.track_error);
            } else {
                // Mock tracking logic - replace with DB call later
                await chat.sendMessage(`${t.tracking_status} ${trackId}: ${t.status_on_way}\n🔗 https://hemohive.com/track/${trackId}`);
            }
            return;
        }

        // Default Fallback
        await chat.sendMessage(t.fallback);

    } catch (error) {
        console.error('Error handling message:', error);
    }
});

client.initialize();
