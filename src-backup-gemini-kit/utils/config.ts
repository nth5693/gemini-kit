/**
 * Configuration utilities
 * Gemini-only configuration
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

export interface ProviderSettings {
    apiKey: string;
    model: string;
}

export interface GeminiKitConfig {
    defaultProvider: 'gemini';
    providers: {
        gemini?: ProviderSettings;
    };
    autoCommit: boolean;
    autoTest: boolean;
    planApproval: boolean;
}

const DEFAULT_CONFIG: GeminiKitConfig = {
    defaultProvider: 'gemini',
    providers: {},
    autoCommit: false,
    autoTest: true,
    planApproval: true,
};

export function getConfigPath(): string {
    return join(homedir(), '.gemini-kit', 'config.json');
}

export function getProjectConfigPath(projectRoot: string): string {
    return join(projectRoot, '.gemini-kit', 'config.json');
}

export function loadConfig(projectRoot?: string): GeminiKitConfig {
    const paths = [
        projectRoot ? getProjectConfigPath(projectRoot) : null,
        getConfigPath(),
    ].filter(Boolean) as string[];

    for (const path of paths) {
        if (existsSync(path)) {
            try {
                const content = readFileSync(path, 'utf-8');
                const parsed = JSON.parse(content);
                // Ensure we only use gemini provider
                return {
                    ...DEFAULT_CONFIG,
                    providers: {
                        gemini: parsed.providers?.gemini
                    },
                    autoCommit: parsed.autoCommit ?? DEFAULT_CONFIG.autoCommit,
                    autoTest: parsed.autoTest ?? DEFAULT_CONFIG.autoTest,
                    planApproval: parsed.planApproval ?? DEFAULT_CONFIG.planApproval,
                };
            } catch {
                // Continue to next path
            }
        }
    }

    // Check for GEMINI_API_KEY environment variable
    const envApiKey = process.env.GEMINI_API_KEY;
    if (envApiKey) {
        return {
            ...DEFAULT_CONFIG,
            providers: {
                gemini: {
                    apiKey: envApiKey,
                    model: 'gemini-2.5-pro',
                },
            },
        };
    }

    return DEFAULT_CONFIG;
}

export function saveConfig(config: GeminiKitConfig, projectRoot?: string): void {
    const path = projectRoot ? getProjectConfigPath(projectRoot) : getConfigPath();
    const dir = dirname(path);

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    writeFileSync(path, JSON.stringify(config, null, 2));
}
