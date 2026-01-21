const fastq = require('fastq');

let checkQueue;
let notificationQueue;

/**
 * Initialize queues with worker functions
 * @param {function} checkWorker - Async function to process website checks
 * @param {function} notificationWorker - Async function to process notifications
 * @param {number} checkConcurrency - Number of concurrent checks (default 5)
 */
const initQueues = (checkWorker, notificationWorker, checkConcurrency = 5) => {
    checkQueue = fastq.promise(checkWorker, checkConcurrency);

    // Telegram rate limits: 1 message per second roughly to the same chat is safe. 
    // We'll set concurrency to 1 to ensure sequential delivery and avoid 429 errors.
    notificationQueue = fastq.promise(notificationWorker, 1);

    console.log(`Queues initialized: Check concurrency ${checkConcurrency}, Notification concurrency 1`);
};

const addToCheckQueue = (task) => {
    if (!checkQueue) throw new Error('Queues not initialized');
    return checkQueue.push(task);
};

const addToNotificationQueue = (task) => {
    if (!notificationQueue) throw new Error('Queues not initialized');
    return notificationQueue.push(task);
};

module.exports = {
    initQueues,
    addToCheckQueue,
    addToNotificationQueue
};
