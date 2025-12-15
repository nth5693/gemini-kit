#!/usr/bin/env node
/**
 * Telegram Notifications Hook
 * Sends notifications to Telegram when tasks complete
 * Triggers on: Stop, session-end
 * 
 * Setup:
 * 1. Create bot: Message @BotFather → /newbot
 * 2. Get chat ID: Message your bot, then visit:
 *    https://api.telegram.org/bot<TOKEN>/getUpdates
 * 3. Set env:
 *    TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
 *    TELEGRAM_CHAT_ID=123456789
 */

import * as https from 'https';

async function sendTelegram(botToken, chatId, message) {
    const payload = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${botToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => reject(false));
        req.write(payload);
        req.end();
    });
}

async function main(input) {
    let data;
    try {
        data = JSON.parse(input);
    } catch {
        console.log(JSON.stringify({}));
        process.exit(0);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log(JSON.stringify({}));
        return;
    }

    const { event, summary, taskName } = data;

    // Build message
    let message = '🤖 *Gemini-Kit*\n\n';
    if (event) message += `*Event:* ${event}\n`;
    if (taskName) message += `*Task:* ${taskName}\n`;
    if (summary) message += `*Summary:* ${summary}\n`;
    message += `*Time:* ${new Date().toLocaleString()}`;

    try {
        await sendTelegram(botToken, chatId, message);
    } catch { }

    console.log(JSON.stringify({}));
}

// Read stdin
const input = await new Promise(resolve => {
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
});

main(input).catch(() => {
    console.log(JSON.stringify({}));
    process.exit(0);
});
