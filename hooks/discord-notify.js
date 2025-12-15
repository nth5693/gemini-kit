#!/usr/bin/env node
/**
 * Discord Notifications Hook
 * Sends notifications to Discord when tasks complete
 * Triggers on: Stop, session-end
 * 
 * Setup:
 * 1. Create Discord webhook: Server Settings → Integrations → Webhooks
 * 2. Set env: DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
 */

import * as https from 'https';
import * as url from 'url';

async function sendDiscord(webhookUrl, message, title = 'Gemini-Kit') {
    const payload = JSON.stringify({
        embeds: [{
            title: `🤖 ${title}`,
            description: message,
            color: 0x4285F4, // Google Blue
            timestamp: new Date().toISOString(),
            footer: { text: 'Gemini-Kit Notification' }
        }]
    });

    const parsed = new URL(webhookUrl);

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            resolve(res.statusCode === 204 || res.statusCode === 200);
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

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log(JSON.stringify({}));
        return;
    }

    const { event, summary, taskName } = data;

    // Build message
    let message = '';
    if (taskName) message += `**Task:** ${taskName}\n`;
    if (summary) message += `**Summary:** ${summary}\n`;
    message += `**Time:** ${new Date().toLocaleString()}`;

    try {
        await sendDiscord(webhookUrl, message, event || 'Task Complete');
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
