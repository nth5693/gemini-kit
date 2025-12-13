/**
 * Design Commands
 * Invokes ui-ux-designer agent
 */

import chalk from 'chalk';
import ora from 'ora';
import { uiUxDesignerAgent } from '../agents/creative/ui-ux-designer.js';
import { providerManager } from '../providers/index.js';

export async function designFastCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎨 Quick Design...\n'));
    const ctx = { projectRoot: process.cwd(), currentTask: `quick design: ${description}`, sharedData: {} };
    const spinner = ora('Creating design...').start();
    try {
        uiUxDesignerAgent.initialize(ctx);
        const result = await uiUxDesignerAgent.execute();
        uiUxDesignerAgent.cleanup();
        if (result.success) { spinner.succeed('Design created'); console.log(result.data.design); }
        else { spinner.fail(result.message); }
    } catch (error) { spinner.fail(`Design failed: ${error}`); }
}

export async function designGoodCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n✨ Premium Design...\n'));
    const ctx = { projectRoot: process.cwd(), currentTask: `premium design: ${description}`, sharedData: {} };
    const spinner = ora('Creating premium design...').start();
    try {
        uiUxDesignerAgent.initialize(ctx);
        const result = await uiUxDesignerAgent.execute();
        uiUxDesignerAgent.cleanup();
        if (result.success) { spinner.succeed('Premium design created'); console.log(result.data.design); }
        else { spinner.fail(result.message); }
    } catch (error) { spinner.fail(`Design failed: ${error}`); }
}

export async function design3dCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎮 Three.js 3D Scene...\n'));
    const spinner = ora('Creating 3D scene...').start();
    try {
        const prompt = `Create Three.js 3D scene for: ${description}. Include scene setup, geometry, animations, OrbitControls, complete HTML.`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('3D scene created');
        console.log(result.content);
    } catch (error) { spinner.fail(`3D design failed: ${error}`); }
}

export async function designDescribeCommand(imagePath: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 Describe Design from Image...\n'));
    console.log(chalk.gray(`Image: ${imagePath}\n`));
    const spinner = ora('Analyzing design...').start();
    try {
        const prompt = `Analyze this design/screenshot and describe:
1. **Layout Structure** - Grid, sections, spacing
2. **Color Palette** - Primary, secondary, accent colors with hex codes
3. **Typography** - Fonts, sizes, weights
4. **Components** - Buttons, cards, forms, navigation
5. **Interactions** - Hover states, animations
6. **CSS Framework Suggestion** - Tailwind classes or vanilla CSS`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('Design described');
        console.log(result.content);
    } catch (error) { spinner.fail(`Describe failed: ${error}`); }
}

export async function designScreenshotCommand(imagePath: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📸 Screenshot to Code...\n'));
    console.log(chalk.gray(`Image: ${imagePath}\n`));
    const spinner = ora('Converting to code...').start();
    try {
        const prompt = `Convert this screenshot to production-ready code:
1. **HTML Structure** - Semantic HTML5
2. **CSS Styling** - Modern CSS with flexbox/grid
3. **Responsive Design** - Mobile-first approach
4. **Accessibility** - ARIA labels, semantic elements
5. **Complete Code** - Ready to use

Provide complete HTML + CSS files.`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('Code generated from screenshot');
        console.log(result.content);
    } catch (error) { spinner.fail(`Screenshot to code failed: ${error}`); }
}

export async function designVideoCommand(videoPath: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎬 Video to Code...\n'));
    console.log(chalk.gray(`Video: ${videoPath}\n`));
    const spinner = ora('Analyzing video...').start();
    try {
        const prompt = `Analyze this video showing a UI interaction and create:
1. **Component Structure** - React/HTML components
2. **Animations** - CSS animations or Framer Motion
3. **State Management** - For interactive elements
4. **Complete Code** - Working implementation

Focus on replicating the shown interactions and animations.`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('Code generated from video');
        console.log(result.content);
    } catch (error) { spinner.fail(`Video to code failed: ${error}`); }
}

