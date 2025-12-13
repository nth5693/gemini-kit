/**
 * Screenshot Skill - Convert screenshot to code
 * Uses AI Vision API to generate HTML/CSS from images
 */

import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

export interface ScreenshotResult {
    success: boolean;
    code: string;
    outputPath?: string;
    error?: string;
}

/**
 * Convert image to base64 for vision API
 */
function imageToBase64(imagePath: string): string | null {
    try {
        const buffer = readFileSync(imagePath);
        const ext = imagePath.split('.').pop()?.toLowerCase() || 'png';
        const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch {
        return null;
    }
}

/**
 * Generate HTML/CSS from screenshot
 */
export async function screenshotToCode(
    imagePath: string,
    options: { framework?: string; style?: string } = {}
): Promise<ScreenshotResult> {
    logger.info(`📸 Processing screenshot: ${imagePath}`);

    if (!existsSync(imagePath)) {
        return { success: false, code: '', error: 'Image file not found' };
    }

    const base64Image = imageToBase64(imagePath);
    if (!base64Image) {
        return { success: false, code: '', error: 'Could not read image' };
    }

    const framework = options.framework || 'html';
    const style = options.style || 'tailwind';

    const prompt = `You are an expert UI developer. Analyze this screenshot and recreate it as code.

Requirements:
- Framework: ${framework}
- Styling: ${style}
- Make it responsive
- Use semantic HTML
- Include all visible elements
- Match colors, spacing, and layout closely

Provide ONLY the code, no explanations. Start with the complete code:`;

    try {
        // Call AI with vision capability
        const response = await providerManager.generate([
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: base64Image } }
                ] as unknown as string
            }
        ]);

        const code = response.content;

        // Extract code block if wrapped
        const codeMatch = code.match(/```(?:html|tsx|jsx)?\n([\s\S]*?)```/);
        const cleanCode = codeMatch ? codeMatch[1] : code;

        // Save to file
        const outputDir = join(process.cwd(), 'generated');
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const outputName = basename(imagePath).replace(/\.[^.]+$/, '.html');
        const outputPath = join(outputDir, outputName);
        writeFileSync(outputPath, cleanCode || '');

        logger.success(`✅ Generated: ${outputPath}`);

        return {
            success: true,
            code: cleanCode || '',
            outputPath
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, code: '', error: message };
    }
}

/**
 * Chat command handler for @screenshot
 */
export async function handleScreenshotCommand(imagePath: string, cwd: string): Promise<string> {
    const fullPath = imagePath.startsWith('/') ? imagePath : join(cwd, imagePath);

    console.log(`\n📸 Converting screenshot to code...`);
    console.log(`   Image: ${imagePath}\n`);

    const result = await screenshotToCode(fullPath);

    if (result.success) {
        return `✅ Code generated!\n📄 Saved to: ${result.outputPath}\n\nPreview:\n\`\`\`html\n${result.code.slice(0, 500)}...\n\`\`\``;
    } else {
        return `❌ Failed: ${result.error}`;
    }
}
