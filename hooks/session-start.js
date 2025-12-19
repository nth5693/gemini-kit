#!/usr/bin/env node
/**
 * SessionStart Hook
 * Initialize gemini-kit on new session
 */

import * as fs from 'fs';
import * as path from 'path';

async function main(input) {
    // Parse input safely - data is validated but not used
    try {
        JSON.parse(input);
    } catch {
        // If parse fails, return success (fail-open)
        console.log(JSON.stringify({}));
        process.exit(0);
    }

    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const kitDir = path.join(projectDir, '.gemini-kit');

    // Ensure kit directories exist
    const dirs = ['artifacts', 'handoffs', 'memory', 'logs'];
    for (const dir of dirs) {
        fs.mkdirSync(path.join(kitDir, dir), { recursive: true });
    }

    // Load/update session stats
    const statsFile = path.join(kitDir, 'stats.json');
    let stats = { sessions: 0, lastSession: null };

    if (fs.existsSync(statsFile)) {
        try {
            stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        } catch { }
    }

    stats.sessions++;
    stats.lastSession = new Date().toISOString();
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    // Return success message
    console.log(JSON.stringify({
        hookSpecificOutput: {
            hookEventName: 'SessionStart',
            additionalContext: `🚀 Gemini-Kit initialized (Session #${stats.sessions})`,
        },
        systemMessage: `🛠️ Gemini-Kit ready | Session #${stats.sessions}`,
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
