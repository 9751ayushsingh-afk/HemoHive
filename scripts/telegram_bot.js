const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Environment Configuration
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

if (!TELEGRAM_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}
if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is missing in .env');
    process.exit(1);
}

// 2. Initialize Bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// 3. Load FAQs
const faqPath = path.join(__dirname, 'faq.json');
let FAQs = [];
try {
    FAQs = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
} catch (err) {
    console.error('⚠️ Could not load faq.json:', err.message);
}

// 4. Database Schema (Inline for script simplicity)
const telegramSessionSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
}, { timestamps: true });

const TelegramSession = mongoose.models.TelegramSession || mongoose.model('TelegramSession', telegramSessionSchema);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
}

// 5. Helper Functions
async function getOrCreateSession(chatId, userDetails) {
    let session = await TelegramSession.findOne({ chatId });
    if (!session) {
        session = await TelegramSession.create({
            chatId,
            username: userDetails.username,
            firstName: userDetails.first_name,
            language: 'en' // Default to English
        });
    }
    return session;
}

// --- MENUS ---
const MAIN_MENU_EN = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "🩸 Check Eligibility", callback_data: "check_eligibility" }, { text: "🏥 Find Blood Bank", callback_data: "find_hospital" }],
            [{ text: "👤 My Profile", callback_data: "my_profile" }, { text: "❓ FAQ", callback_data: "faq_menu" }],
            [{ text: "🌐 Change Language / भाषा बदलें", callback_data: "change_lang" }]
        ]
    }
};

const MAIN_MENU_HI = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "🩸 योग्यता जांचें", callback_data: "check_eligibility" }, { text: "🏥 ब्लड बैंक खोजें", callback_data: "find_hospital" }],
            [{ text: "👤 मेरी प्रोफाइल", callback_data: "my_profile" }, { text: "❓ अक्सर पूछे जाने वाले प्रश्न", callback_data: "faq_menu" }],
            [{ text: "🌐 Change Language / भाषा बदलें", callback_data: "change_lang" }]
        ]
    }
};

// 6. Bot Event Listeners
bot.on('polling_error', (error) => {
    console.log(`[Polling Error] ${error.code}: ${error.message}`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    await connectDB();
    const session = await getOrCreateSession(chatId, msg.chat);
    const lang = session.language || 'en';

    // Command Handling
    if (text.startsWith('/')) {
        if (text === '/start') {
            const welcomeMsg = lang === 'en'
                ? `👋 Namaste ${msg.chat.first_name}! Welcome to **RaktBandhu**.\nYour 24/7 Blood Donation Assistant.`
                : `👋 नमस्ते ${msg.chat.first_name}! **रक्तबंधु** में आपका स्वागत है।\nआपका 24/7 रक्तदान सहायक।`;

            const menu = lang === 'en' ? MAIN_MENU_EN : MAIN_MENU_HI;
            bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown', ...menu });
        } else if (text === '/help') {
            bot.sendMessage(chatId, "ℹ️ *Help Menu*\n\n/start - Main Menu\n/status - Check Donation Status\nTyping keywords like 'eligibility' also checks FAQs.", { parse_mode: 'Markdown' });
        }
        return;
    }

    // Keyword Matching for FAQ
    const lowerText = text.toLowerCase();
    const match = FAQs.find(q => lowerText.includes(q.keyword.toLowerCase()));

    if (match) {
        const answer = lang === 'en' ? match.answer_en : match.answer_hi;
        bot.sendMessage(chatId, `💡 **FAQ Answer**:\n${answer}`, { parse_mode: 'Markdown' });
    } else {
        // Fallback
        const fallback = lang === 'en'
            ? "I didn't understand that. Please use the menu below or type keywords like 'eligibility' or 'blood types'."
            : "मैं समझा नहीं। कृपया नीचे दिए गए मेनू का उपयोग करें या 'eligibility' जैसे कीवर्ड टाइप करें।";
        const menu = lang === 'en' ? MAIN_MENU_EN : MAIN_MENU_HI;
        bot.sendMessage(chatId, fallback, { ...menu });
    }
});

// Callback Query Handler (Button Clicks)
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    await connectDB();
    const session = await TelegramSession.findOne({ chatId });
    const lang = session ? session.language : 'en';

    // Acknowledge the callback (stops loading spinner)
    bot.answerCallbackQuery(query.id);

    if (data === 'change_lang') {
        const newLang = lang === 'en' ? 'hi' : 'en';
        session.language = newLang;
        await session.save();

        const msg = newLang === 'en' ? "✅ Language changed to English." : "✅ भाषा हिंदी में बदल दी गई है।";
        const menu = newLang === 'en' ? MAIN_MENU_EN : MAIN_MENU_HI;
        bot.sendMessage(chatId, msg, { ...menu });
    }

    else if (data === 'check_eligibility') {
        const msg = lang === 'en'
            ? "🩸 **Eligibility Criteria of the**\n- Age: 18-65 years\n- Weight: >50kg\n- Gap: 3 months (Men), 4 months (Women)\n\nDo you meet these?"
            : "🩸 **पात्रता मानदंड**\n- आयु: 18-65 वर्ष\n- वजन: >50 किग्रा\n- अंतराल: 3 महीने (पुरुष), 4 महीने (महिलाएं)\n\nक्या आप इनसे मिलते हैं?";
        bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    }

    else if (data === 'find_hospital') {
        bot.sendMessage(chatId, "🏥 To find a blood bank, please visit: https://hemohive.onrender.com");
    }

    else if (data === 'my_profile') {
        // Mock Profile Data
        const profile = lang === 'en'
            ? "👤 **My Profile**\nName: Guest User\nCredits: 0\nStatus: Verify Account on HemoHive"
            : "👤 **मेरी प्रोफाइल**\nनाम: अतिथि उपयोगकर्ता\nक्रेडिट: 0\nस्थिति: हेमोहाइव पर खाता सत्यापित करें";
        bot.sendMessage(chatId, profile, { parse_mode: 'Markdown' });
    }

    else if (data === 'faq_menu') {
        // Simple list of keywords to try
        const msg = "❓ **FAQ Topics**\nTry typing these words:\n- eligibility\n- side effects\n- how often\n- alcohol\n- tattoo";
        bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    }
});

console.log('🚀 RaktBandhu (Rules-Based) Bot started...');
