const TelegramBot = require('node-telegram-bot-api');

let bot;
let groupChatId;

const initTelegram = (token, chatId) => {
    if (!token || !chatId) {
        console.warn('Telegram token or chat ID missing. Notifications will be disabled.');
        return;
    }
    bot = new TelegramBot(token, { polling: false });
    groupChatId = chatId;
    console.log('Telegram service initialized');
};

const sendTelegramMessage = async (message) => {
    if (!bot || !groupChatId) {
        console.log('Telegram not configured, skipping message:', message);
        return;
    }
    try {
        await bot.sendMessage(groupChatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Failed to send Telegram message:', error.message);
        // Note: In a production app, we might want to retry, but the queue handles retries if the worker throws.
        // For now, we log and catch so the queue doesn't get stuck if it's a permanent error?
        // Actually, if we throw, fastq might retry if configured, or just fail the task. 
        // We'll throw so the worker knows it failed, but we should handle specific errors like 429 separately.
        throw error;
    }
};

module.exports = {
    initTelegram,
    sendTelegramMessage
};
