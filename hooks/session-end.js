#!/usr/bin/env node
/**
 * SessionEnd Hook
 * Cleanup and save session logs
 */

import * as fs from 'fs';
import * as path from 'path';

async function main(input) {
    // Parse input safely
    let data;
    try {
        data = JSON.parse(input);
    } catch {
        console.log(JSON.stringify({}));
        process.exit(0);
    }

    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const sessionId = process.env.GEMINI_SESSION_ID || 'unknown';
    const kitDir = path.join(projectDir, '.gemini-kit');

    // Clean old handoffs (keep last 10)
    const handoffDir = path.join(kitDir, 'handoffs');
    if (fs.existsSync(handoffDir)) {
        try {
            const files = fs.readdirSync(handoffDir).sort();
            if (files.length > 10) {
                for (const f of files.slice(0, -10)) {
                    fs.unlinkSync(path.join(handoffDir, f));
                }
            }
        } catch { }
    }

    // Log session end
    const logsDir = path.join(kitDir, 'logs');
    fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, 'sessions.log');
    const logEntry = `[${new Date().toISOString()}] Session ${sessionId} ended\n`;

    try {
        fs.appendFileSync(logFile, logEntry);
    } catch { }

    console.log(JSON.stringify({
        systemMessage: '👋 Gemini-Kit session saved',
    }));
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
