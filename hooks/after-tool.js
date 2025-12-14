#!/usr/bin/env node
/**
 * AfterTool Hook
 * Auto-run tests after code changes
 */

import { execSync } from 'child_process';
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

    const { tool_name, tool_input } = data;
    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();

    // Only for file write operations
    if (!['WriteFile', 'Edit', 'write_file', 'edit'].includes(tool_name)) {
        console.log(JSON.stringify({}));
        return;
    }

    const filePath = tool_input?.file_path;
    if (!filePath?.match(/\.(ts|tsx|js|jsx)$/)) {
        console.log(JSON.stringify({}));
        return;
    }

    // Find test file
    const ext = path.extname(filePath);
    const base = filePath.slice(0, -ext.length);
    const testFiles = [
        `${base}.test${ext}`,
        `${base}.spec${ext}`,
    ];

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectDir, filePath);
    const testFile = testFiles.find(f => {
        const testPath = path.isAbsolute(f) ? f : path.join(projectDir, f);
        return fs.existsSync(testPath);
    });

    if (!testFile) {
        console.log(JSON.stringify({
            systemMessage: `⚠️ No test file for ${path.basename(filePath)}`,
        }));
        return;
    }

    // Run tests
    try {
        execSync(`npm test -- ${testFile} --silent 2>&1`, {
            cwd: projectDir,
            encoding: 'utf8',
            timeout: 30000,
        });

        console.log(JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'AfterTool',
                additionalContext: `✅ Tests passed for ${path.basename(filePath)}`,
            },
            systemMessage: `✅ Tests passed`,
        }));
    } catch {
        console.log(JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'AfterTool',
                additionalContext: `❌ Tests FAILED for ${path.basename(filePath)}. Fix before continuing.`,
            },
            systemMessage: `❌ Tests failed!`,
        }));
    }
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
