#!/usr/bin/env node
/**
 * Scout Block Hook
 * Prevents file modifications when in scout/exploration mode
 * Triggers on: PreToolUse
 */

import * as fs from 'fs';
import * as path from 'path';

const BLOCKED_TOOLS = [
    'Write', 'Edit', 'Bash', 'Delete', 'Move', 'Rename',
    'write_to_file', 'replace_file_content', 'multi_replace_file_content',
    'run_command'
];

async function main(input) {
    let data;
    try {
        data = JSON.parse(input);
    } catch {
        console.log(JSON.stringify({}));
        process.exit(0);
    }

    const { toolName } = data;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '/tmp';
    const stateFile = path.join(homeDir, '.gemini-kit', 'state', 'scout-mode.json');

    // Check if scout mode is active
    let scoutMode = false;
    if (fs.existsSync(stateFile)) {
        try {
            const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            scoutMode = state.active && (Date.now() - new Date(state.startedAt).getTime() < 30 * 60 * 1000); // 30 min timeout
        } catch { }
    }

    // If scout mode active and tool is blocked
    if (scoutMode && toolName && BLOCKED_TOOLS.some(t => toolName.toLowerCase().includes(t.toLowerCase()))) {
        console.log(JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                decision: 'block',
                message: `🛑 Scout Mode Active - Cannot use "${toolName}"\n\nIn scout mode, file modifications are blocked.\nUse \`kit_exit_scout_mode\` to exit scout mode first.`
            }
        }));
        return;
    }

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
