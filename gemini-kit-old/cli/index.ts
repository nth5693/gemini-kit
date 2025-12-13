/**
 * Gemini-Kit CLI - Beautiful ClaudeKit-style Interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

// Core
import { cookCommand } from '../commands/cook.js';
import { bootstrapCommand } from '../commands/bootstrap.js';
import { planCommand, planCiCommand, planTwoCommand, planCroCommand } from '../commands/plan.js';
import { codeCommand } from '../commands/code.js';
import { codeReviewCommand } from '../commands/code-review.js';
import { scoutCommand } from '../commands/scout.js';
import { initCommand } from '../commands/init.js';
import { testCommand } from '../commands/test.js';
import { debugCommand } from '../commands/debug.js';
import { askCommand } from '../commands/ask.js';
import { watzupCommand } from '../commands/watzup.js';

// Fix
import { fixFastCommand, fixHardCommand, fixTypesCommand, fixTestCommand, fixUiCommand, fixCiCommand, fixLogsCommand } from '../commands/fix.js';

// Git
import { gitCommitCommand, gitCommitPushCommand } from '../commands/git.js';

// Docs
import { docsInitCommand, docsUpdateCommand, docsSummarizeCommand } from '../commands/docs.js';

// Design
import { designFastCommand, designGoodCommand, design3dCommand, designDescribeCommand, designScreenshotCommand, designVideoCommand } from '../commands/design.js';

// Content
import { contentFastCommand, contentGoodCommand, contentCroCommand, contentEnhanceCommand } from '../commands/content.js';

// Research
import { researchDeepCommand, researchQuickCommand } from '../commands/research.js';

// Database
import { dbQueryCommand, dbOptimizeCommand, dbSchemaCommand } from '../commands/db.js';

// Integrate
import { integratePolarCommand, integrateSePayCommand } from '../commands/integrate.js';

// Other
import { brainstormCommand } from '../commands/brainstorm.js';
import { journalCommand } from '../commands/journal.js';
import { chatCommand } from '../commands/chat.js';

// Session
import { sessionListCommand, sessionSaveCommand, sessionLoadCommand, sessionInfoCommand, sessionDeleteCommand } from '../commands/session.js';

const program = new Command();
program.name('gk').description('Gemini-Kit: ClaudeKit-style AI Assistant').version('0.3.2');


// === CORE (10) ===
program.command('cook <task>').description('All-in-one workflow').action(cookCommand);
program.command('bootstrap <name>').description('New project').option('-t, --template <t>').action((n, o) => bootstrapCommand(n, o.template));
program.command('scout <query>').description('Search codebase').action(scoutCommand);
program.command('init').description('Initialize').action(initCommand);
program.command('test').description('Run tests').action(testCommand);
program.command('debug <issue>').description('Debug issue').action(debugCommand);
program.command('ask <question>').description('Ask about codebase').action(askCommand);
program.command('watzup').description('Project status').action(watzupCommand);
program.command('code <path>').description('Code from plan').action(codeCommand);
program.command('code-review [file]').description('Code review').action(codeReviewCommand);

// === PLAN (4) ===
const plan = program.command('plan').description('Planning');
plan.command('feature <desc>').description('Create plan').action(planCommand);
plan.command('ci <url>').description('CI fix plan').action(planCiCommand);
plan.command('two <feature>').description('2 approaches').action(planTwoCommand);
plan.command('cro <page>').description('CRO plan').action(planCroCommand);

// === FIX (7) ===
const fix = program.command('fix').description('Fix issues');
fix.command('fast').description('Quick').action(fixFastCommand);
fix.command('hard <issue>').description('Complex').action(fixHardCommand);
fix.command('types').description('TypeScript').action(fixTypesCommand);
fix.command('test').description('Tests').action(fixTestCommand);
fix.command('ui <comp>').description('UI').action(fixUiCommand);
fix.command('ci').description('CI/CD').action(fixCiCommand);
fix.command('logs [file]').description('Logs').action(fixLogsCommand);

// === GIT (3) ===
const git = program.command('git').description('Git');
git.command('cm').description('Commit').action(gitCommitCommand);
git.command('cp').description('Commit+Push').action(gitCommitPushCommand);
git.command('pr <branch>').description('PR').action(async (b) => console.log(chalk.cyan('🔀 PR:'), b));

// === DOCS (3) ===
const docs = program.command('docs').description('Docs');
docs.command('init').description('Init').action(docsInitCommand);
docs.command('update').description('Update').action(docsUpdateCommand);
docs.command('summarize').description('Summarize').action(docsSummarizeCommand);

// === DESIGN (6) ===
const design = program.command('design').description('Design');
design.command('fast <desc>').description('Quick').action(designFastCommand);
design.command('good <desc>').description('Premium').action(designGoodCommand);
design.command('3d <desc>').description('Three.js').action(design3dCommand);
design.command('describe <img>').description('Describe image').action(designDescribeCommand);
design.command('screenshot <img>').description('Screenshot→Code').action(designScreenshotCommand);
design.command('video <vid>').description('Video→Code').action(designVideoCommand);

// === CONTENT (4) ===
const content = program.command('content').description('Content');
content.command('fast <desc>').description('Quick').action(contentFastCommand);
content.command('good <desc>').description('Quality').action(contentGoodCommand);
content.command('cro <desc>').description('CRO').action(contentCroCommand);
content.command('enhance <text>').description('Enhance').action(contentEnhanceCommand);

// === RESEARCH (2) ===
const research = program.command('research').description('Research');
research.command('deep <topic>').description('Deep').action(researchDeepCommand);
research.command('quick <topic>').description('Quick').action(researchQuickCommand);

// === DB (3) ===
const db = program.command('db').description('Database');
db.command('query <sql>').description('Query').action(dbQueryCommand);
db.command('optimize').description('Optimize').action(dbOptimizeCommand);
db.command('schema').description('Schema').action(dbSchemaCommand);

// === INTEGRATE (2) ===
const integrate = program.command('integrate').description('Integrations');
integrate.command('polar').description('Polar.sh').action(integratePolarCommand);
integrate.command('sepay').description('SePay.vn').action(integrateSePayCommand);

// === OTHER (3) ===
program.command('brainstorm <topic>').description('Ideas').action(brainstormCommand);
program.command('journal').description('Journal').action(journalCommand);
program.command('chat').description('Interactive chat with AI').action(chatCommand);

// === SESSION (5) ===
const session = program.command('session').description('Session management');
session.command('list').description('List saved sessions').action(sessionListCommand);
session.command('save [name]').description('Save current session').action(sessionSaveCommand);
session.command('load [id]').description('Load session').action(sessionLoadCommand);
session.command('info').description('Show current session info').action(sessionInfoCommand);
session.command('delete <id>').description('Delete session').action(sessionDeleteCommand);

// Banner
logger.header('Gemini-Kit v0.3.1', '15 Agents • 43+ Commands • Multi-Model AI');

program.parse();

