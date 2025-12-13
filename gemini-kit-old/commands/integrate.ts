/**
 * Integrate Commands
 * Payment integrations (Polar, SePay)
 */

import chalk from 'chalk';
import ora from 'ora';
import { providerManager } from '../providers/index.js';

export async function integratePolarCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n💳 Integrate Polar.sh...\n'));

    const spinner = ora('Generating Polar integration...').start();

    try {
        const prompt = `You are an integration expert. Create a complete Polar.sh payment integration:

1. **Installation**
   - Required packages
   - Environment variables

2. **Server Setup**
   - API routes for webhooks
   - Checkout session creation
   - Subscription management

3. **Client Components**
   - Pricing page
   - Checkout button
   - Subscription status

4. **Complete Code Files**
   - API routes (Next.js App Router style)
   - React components
   - Type definitions
   - Environment example

Provide production-ready code with TypeScript.`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Polar integration generated');
        console.log(chalk.white('\n📦 Polar.sh Integration:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Integration failed: ${error}`);
    }
}

export async function integrateSePayCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n💳 Integrate SePay.vn...\n'));

    const spinner = ora('Generating SePay integration...').start();

    try {
        const prompt = `You are a Vietnamese payment integration expert. Create a complete SePay.vn integration:

1. **SePay Account Setup**
   - API credentials
   - Webhook configuration

2. **Server Implementation**
   - QR code generation
   - Payment verification webhook
   - Transaction status check

3. **Client Components**
   - Payment page with QR display
   - Payment status polling
   - Success/failure handling

4. **Complete Code**
   - Next.js API routes
   - React components
   - Type definitions

Provide production-ready code for Vietnam market.`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('SePay integration generated');
        console.log(chalk.white('\n📦 SePay.vn Integration:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Integration failed: ${error}`);
    }
}
