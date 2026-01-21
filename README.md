# Node.js Advanced Uptime Monitor

This project is a robust Node.js application that regularly checks the status (UP/DOWN) of your websites, utilizes a queue-based architecture, and sends instant notifications via Telegram in case of downtime.

## 🚀 Features

*   **Queue-Based Architecture:** Uses the `fastq` library to manage concurrency, ensuring the system remains stable and does not get overwhelmed even when monitoring a large number of websites.
*   **Instant Telegram Notifications:** Sends detailed alerts to your specified Telegram group when a website becomes inaccessible or recovers.
*   **Downtime Tracking:** Calculates and reports exactly how long a site was down upon recovery.
*   **Error Handling:** Network errors and timeouts are caught and handled gracefully.
*   **Easy Configuration:** Manage websites and check intervals via a simple JSON configuration file.

## 🛠 Installation

1.  Clone or download this project to your computer.
2.  Open a terminal in the project directory and install the necessary packages:

```bash
npm install
```

## ⚙️ Configuration

The project requires two configuration files to run.

### 1. .env File
Create a file named `.env` in the project root directory and enter your Telegram bot credentials:

```env
TELEGRAM_BOT_TOKEN=YourBotToken
TELEGRAM_CHAT_ID=YourChatID
```

> **Note:** You can use [@BotFather](https://t.me/BotFather) to create your Telegram bot. To find your Chat ID, add the bot to a group, send a message, and check for updates via the API.

### 2. config.json File
Specify the websites to monitor in the `config.json` file:

```json
{
  "checkIntervalSeconds": 60,
  "websites": [
    {
      "name": "Google",
      "url": "https://www.google.com"
    },
    {
      "name": "My Portfolio",
      "url": "https://ibrahimkaya.dev"
    }
  ]
}
```

*   `checkIntervalSeconds`: Determines how often (in seconds) the check loop runs.
*   `websites`: The list of websites to be monitored.

## ▶️ Usage

To start the application:

```bash
node app.js
```

You will start seeing logs in the console once the application starts. You will receive notifications in your Telegram group when a site goes "DOWN" or comes back "UP".

## 📂 Project Structure

*   `app.js`: The main entry point of the application. Manages loops and business logic.
*   `services/queue.js`: Queue service for concurrency control and rate limiting.
*   `services/telegram.js`: Service that communicates with the Telegram API.

## 🛡️ Security and Performance

*   A 10-second timeout is defined for HTTP requests.
*   Notifications are sent via a separate queue to avoid hitting Telegram API rate limits.
*   Global error catchers (`uncaughtException`) are in place to prevent the application from crashing unexpectedly.
