require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const queueService = require('./services/queue');
const telegramService = require('./services/telegram');

// Global Error Handling
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Load Config
const configPath = path.join(__dirname, 'config.json');
let config;
try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configFile);
} catch (error) {
    console.error('Error loading config.json:', error.message);
    process.exit(1);
}

// State tracking
const siteStates = {}; // { url: { isDown: boolean, downSince: Date, lastError: string } }

// Worker for checking websites
const checkWorker = async (website) => {
    const { url, name } = website;

    // Initialize state if not exists
    if (!siteStates[url]) {
        siteStates[url] = { isDown: false, downSince: null, lastError: null };
    }

    const state = siteStates[url];

    try {
        const start = Date.now();
        await axios.get(url, {
            timeout: 10000, // 10 seconds timeout
            validateStatus: (status) => status >= 200 && status < 300 // Only 2xx is considered UP
        });
        const duration = Date.now() - start;

        // If site was down, it is now recovered
        if (state.isDown) {
            const downTimeDuration = ((Date.now() - state.downSince) / 1000).toFixed(1);
            const message = `✅ **RECOVERY ALERT**\n\nWebsite: ${name} (${url})\nStatus: **UP**\nDowntime: ${downTimeDuration}s`;

            queueService.addToNotificationQueue({ message });

            state.isDown = false;
            state.downSince = null;
            state.lastError = null;
            console.log(`[${new Date().toISOString()}] ${name} is BACK UP. Downtime: ${downTimeDuration}s`);
        } else {
            console.log(`[${new Date().toISOString()}] ${name} is UP (${duration}ms)`);
        }

    } catch (error) {
        const errorMsg = error.message || 'Unknown Error';

        // If site was up, it is now down
        if (!state.isDown) {
            state.isDown = true;
            state.downSince = Date.now();
            state.lastError = errorMsg;

            const message = `🔴 **DOWN ALERT**\n\nWebsite: ${name} (${url})\nStatus: **DOWN**\nError: ${errorMsg}\nTime: ${new Date().toLocaleString()}`;

            queueService.addToNotificationQueue({ message });

            console.log(`[${new Date().toISOString()}] ${name} went DOWN. Error: ${errorMsg}`);
        } else {
            console.log(`[${new Date().toISOString()}] ${name} is still DOWN. Error: ${errorMsg}`);
        }
    }
};

// Worker for sending notifications
const notificationWorker = async (task) => {
    await telegramService.sendTelegramMessage(task.message);
};

// Initialize Services
telegramService.initTelegram(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID);
queueService.initQueues(checkWorker, notificationWorker, 5); // 5 concurrent checks

// Schedule Checks
const startMonitoring = () => {
    const intervalSeconds = config.checkIntervalSeconds || 60;
    console.log(`Starting monitoring for ${config.websites.length} websites. Interval: ${intervalSeconds}s`);

    // Initial check
    config.websites.forEach(site => queueService.addToCheckQueue(site));

    // Periodic check
    const intervalId = setInterval(() => {
        config.websites.forEach(site => queueService.addToCheckQueue(site));
    }, intervalSeconds * 1000);

    // Graceful Shutdown
    const shutdown = () => {
        console.log('Shutting down...');
        clearInterval(intervalId);
        // Process would exit naturally after queues drain, or we can force it if needed.
        // For now, let's just log and let node exit when event loop is empty if possible, 
        // but interval keeps it open. ClearInterval allows exit if no pending tasks.
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

startMonitoring();
