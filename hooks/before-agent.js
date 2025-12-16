#!/usr/bin/env node
/**
 * BeforeAgent Hook
 * Inject relevant learnings based on prompt context (Phase 5 - Vector Learnings)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Simple semantic matching for learnings
function findRelevantLearnings(prompt, learningsContent, limit = 3) {
    // Extract keywords from prompt
    const promptTerms = prompt.toLowerCase().match(/\b[a-z][a-z0-9_]{2,}\b/g) || [];

    // Parse learnings into sections
    const sections = learningsContent.split(/## \[/).slice(1).map(s => '## [' + s);

    if (sections.length === 0) return [];

    // Score each learning by relevance to prompt
    const scored = sections.map(section => {
        let score = 0;
        const sectionLower = section.toLowerCase();

        for (const term of promptTerms) {
            const matches = (sectionLower.match(new RegExp(term, 'g')) || []).length;
            score += matches;

            // Bonus for term in Lesson line
            if (sectionLower.includes(`lesson:** ${term}`) ||
                sectionLower.includes(`lesson:**${term}`)) {
                score += 3;
            }
        }

        return { section, score };
    });

    // Return top relevant learnings
    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.section);
}

async function main(input) {
    // Parse input safely
    let data;
    try {
        data = JSON.parse(input);
    } catch {
        console.log(JSON.stringify({}));
        process.exit(0);
    }

    const { prompt } = data;
    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const homeDir = process.env.HOME || process.env.USERPROFILE || '/tmp';

    if (!prompt?.trim()) {
        console.log(JSON.stringify({}));
        return;
    }

    const context = [];

    // ═══════════════════════════════════════════════════════════════
    // INJECT RELEVANT LEARNINGS (Phase 5 - Vector Learnings)
    // ═══════════════════════════════════════════════════════════════
    const learningsFile = path.join(homeDir, '.gemini-kit', 'learnings', 'LEARNINGS.md');
    if (fs.existsSync(learningsFile)) {
        try {
            const learningsContent = fs.readFileSync(learningsFile, 'utf8');

            // Find learnings relevant to current prompt
            const relevantLearnings = findRelevantLearnings(prompt, learningsContent, 3);

            if (relevantLearnings.length > 0) {
                context.push(`## 🧠 Relevant Learnings (Apply these!)\n\n${relevantLearnings.join('\n')}`);
            }
        } catch { }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTO-INJECT WORKFLOW CONTEXT (Gemini-Kit-style)
    // ═══════════════════════════════════════════════════════════════
    const extensionDir = path.join(homeDir, '.gemini', 'extensions', 'gemini-kit');
    const workflowDir = path.join(extensionDir, '.agent', 'workflows');

    if (fs.existsSync(workflowDir)) {
        try {
            // Always inject development rules
            const devRulesFile = path.join(workflowDir, 'development-rules.md');
            if (fs.existsSync(devRulesFile)) {
                const devRules = fs.readFileSync(devRulesFile, 'utf8');
                context.push(`## 📋 Development Rules\n\n${devRules.slice(0, 500)}...`);
            }

            // Inject orchestration protocol for complex tasks
            const orchestrationKeywords = ['cook', 'workflow', 'plan', 'team', 'agent', 'orchestr'];
            if (orchestrationKeywords.some(kw => prompt.toLowerCase().includes(kw))) {
                const orchFile = path.join(workflowDir, 'orchestration-protocol.md');
                if (fs.existsSync(orchFile)) {
                    const orchContent = fs.readFileSync(orchFile, 'utf8');
                    context.push(`## 🔄 Orchestration Protocol\n\n${orchContent.slice(0, 800)}...`);
                }
            }

            // Inject doc rules when documentation mentioned
            const docKeywords = ['doc', 'readme', 'changelog', 'document'];
            if (docKeywords.some(kw => prompt.toLowerCase().includes(kw))) {
                const docFile = path.join(workflowDir, 'documentation-management.md');
                if (fs.existsSync(docFile)) {
                    const docContent = fs.readFileSync(docFile, 'utf8');
                    context.push(`## 📝 Documentation Guidelines\n\n${docContent.slice(0, 500)}...`);
                }
            }
        } catch { }
    }

    // Add recent git activity if relevant
    const keywords = ['commit', 'change', 'recent', 'history', 'git'];
    if (keywords.some(kw => prompt.toLowerCase().includes(kw))) {
        try {
            const log = execSync('git log --oneline -5', {
                cwd: projectDir,
                encoding: 'utf8',
                timeout: 5000
            });
            context.push(`Recent commits:\n${log}`);
        } catch { }
    }

    // Add previous handoffs if any
    const handoffDir = path.join(projectDir, '.gemini-kit', 'handoffs');
    if (fs.existsSync(handoffDir)) {
        try {
            const files = fs.readdirSync(handoffDir).slice(-3);
            if (files.length > 0) {
                const handoffs = files.map(f => {
                    const content = JSON.parse(fs.readFileSync(path.join(handoffDir, f), 'utf8'));
                    return `- ${content.from} → ${content.to}: ${String(content.context).slice(0, 100)}...`;
                });
                context.push(`Recent agent handoffs:\n${handoffs.join('\n')}`);
            }
        } catch { }
    }

    if (context.length > 0) {
        console.log(JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'BeforeAgent',
                additionalContext: `## Project Context\n\n${context.join('\n\n')}`,
            },
        }));
    } else {
        console.log(JSON.stringify({}));
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
