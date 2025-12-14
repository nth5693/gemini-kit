#!/usr/bin/env node
/**
 * BeforeTool Hook
 * Security validation - block secrets and dangerous commands
 */

// Secret patterns to detect
const SECRET_PATTERNS = [
    /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
    /password\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/i,
    /secret\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
    /AKIA[0-9A-Z]{16}/,               // AWS Access Key
    /ghp_[a-zA-Z0-9]{36}/,            // GitHub Personal Token
    /sk-[a-zA-Z0-9]{48}/,             // OpenAI API Key
    /AIza[a-zA-Z0-9_-]{35}/,          // Google API Key
    /xox[baprs]-[a-zA-Z0-9-]{10,}/,   // Slack Token
];

// Dangerous shell commands
const DANGEROUS_COMMANDS = [
    'rm -rf /',
    'rm -rf ~',
    'dd if=',
    ':(){:|:&};:',
    'mkfs.',
    'sudo rm',
    '> /dev/sda',
];

async function main(input) {
    // Parse input safely
    let data;
    try {
        data = JSON.parse(input);
    } catch {
        // If parse fails, allow (fail-open)
        console.log(JSON.stringify({ decision: 'allow' }));
        process.exit(0);
    }

    const { tool_name, tool_input } = data;

    // Check for secrets in file content
    const content = tool_input?.content || tool_input?.new_string || '';

    for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
            console.log(JSON.stringify({
                decision: 'deny',
                reason: '🚨 Potential secret/API key detected. Remove sensitive data before proceeding.',
                systemMessage: '🔐 Secret scanner blocked operation',
            }));
            process.exit(2);
        }
    }

    // Check for dangerous shell commands
    if (tool_name === 'RunShellCommand' || tool_name === 'run_shell_command') {
        const cmd = tool_input?.command || '';

        for (const dangerous of DANGEROUS_COMMANDS) {
            if (cmd.includes(dangerous)) {
                console.log(JSON.stringify({
                    decision: 'deny',
                    reason: `🚫 Dangerous command blocked: ${dangerous}`,
                    systemMessage: '⛔ Dangerous command blocked',
                }));
                process.exit(2);
            }
        }
    }

    // All checks passed
    console.log(JSON.stringify({ decision: 'allow' }));
}

// Read stdin
const input = await new Promise(resolve => {
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
});

main(input).catch(() => {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
});
