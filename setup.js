const fs = require('fs');
const path = require('path');

// This is a simple setup script to create .env and config.json files if they don't exist.
// It copies the example files to the actual files.

const copyFileIfNotExists = (source, target) => {
    const sourcePath = path.join(__dirname, source);
    const targetPath = path.join(__dirname, target);

    if (fs.existsSync(targetPath)) {
        console.log(`⚠️  ${target} already exists. Skipping...`);
    } else {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`✅ Created ${target} from ${source}`);
        } else {
            console.error(`❌ Source file ${source} not found!`);
        }
    }
};

console.log('🚀 Starting project setup...');

copyFileIfNotExists('.env.example', '.env');
copyFileIfNotExists('config.example.json', 'config.json');

console.log('\n✨ Setup complete!');
console.log('👉 Please edit .env file and set your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
console.log('👉 Please edit config.json to add your websites.');
