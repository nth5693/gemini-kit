/**
 * Database Commands
 * Invokes database-admin agent for DB operations
 */

import chalk from 'chalk';
import ora from 'ora';
import { databaseAdminAgent } from '../agents/devops/database-admin.js';
import { providerManager } from '../providers/index.js';

export async function dbQueryCommand(query: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🗄️ Database Query Analysis...\n'));
    console.log(chalk.gray(`Query: ${query}\n`));

    const spinner = ora('Analyzing query...').start();

    try {
        const prompt = `You are a database expert. Analyze this query:

\`\`\`sql
${query}
\`\`\`

Provide:
1. **Query Explanation** - What it does
2. **Performance Analysis** - Potential bottlenecks
3. **Index Recommendations**
4. **Optimized Version** - If improvements possible
5. **Security Check** - SQL injection risks
6. **Best Practices** - Recommendations`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Query analyzed');
        console.log(chalk.white('\n📋 Analysis:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Analysis failed: ${error}`);
    }
}

export async function dbOptimizeCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ Database Optimization...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'database optimization analysis',
        sharedData: {},
    };

    const spinner = ora('Analyzing database...').start();

    try {
        databaseAdminAgent.initialize(ctx);
        const result = await databaseAdminAgent.execute();
        databaseAdminAgent.cleanup();

        if (result.success) {
            spinner.succeed('Optimization analysis complete');
            console.log(chalk.white('\n📋 Recommendations:\n'));
            console.log(result.data.optimization);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Optimization failed: ${error}`);
    }
}

export async function dbSchemaCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📊 Database Schema Analysis...\n'));

    const spinner = ora('Analyzing schema...').start();

    try {
        const prompt = `You are a database architect. Analyze the project and provide:

1. **Current Schema Detection**
   - Look for Prisma schema, TypeORM entities, SQL files
   
2. **Schema Best Practices**
   - Normalization recommendations
   - Relationship design
   - Indexing strategy
   
3. **Migration Strategy**
   - Safe migration practices
   - Rollback procedures
   
4. **Performance Considerations**
   - Query optimization
   - Caching strategies
   
5. **Security**
   - Data encryption
   - Access control`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Schema analysis complete');
        console.log(chalk.white('\n📋 Schema Analysis:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Schema analysis failed: ${error}`);
    }
}
