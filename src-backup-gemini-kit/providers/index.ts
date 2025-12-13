/**
 * Provider Manager
 * Gemini-only AI provider (with Pro account)
 */

import { Message, GenerateOptions, GenerateResult, StreamChunk } from './base-provider.js';
import { GeminiProvider } from './gemini.js';
import { loadConfig } from '../utils/config.js';

export type ProviderName = 'gemini';

export interface ProviderConfig {
    apiKey: string;
    model?: string;
}

export class ProviderManager {
    private provider: GeminiProvider | null = null;

    constructor() {
        this.loadFromConfig();
    }

    private loadFromConfig(): void {
        const config = loadConfig();

        if (config.providers.gemini?.apiKey) {
            this.provider = new GeminiProvider(
                config.providers.gemini.apiKey,
                config.providers.gemini.model || 'gemini-2.5-pro'
            );
        }
    }

    /**
     * Get the Gemini provider
     */
    get(): GeminiProvider | null {
        return this.provider;
    }

    /**
     * Get active provider (same as get for Gemini-only)
     */
    getActive(): GeminiProvider | null {
        return this.provider;
    }

    /**
     * Get provider name
     */
    getActiveName(): ProviderName {
        return 'gemini';
    }

    /**
     * List available providers
     */
    listAvailable(): ProviderName[] {
        return this.provider ? ['gemini'] : [];
    }

    /**
     * Generate using Gemini
     */
    async generate(
        messages: Message[],
        options?: GenerateOptions
    ): Promise<GenerateResult> {
        if (!this.provider) {
            throw new Error('Gemini provider not configured. Please set GEMINI_API_KEY.');
        }
        return this.provider.generate(messages, options);
    }

    /**
     * Generate stream using Gemini
     */
    async *generateStream(
        messages: Message[],
        options?: GenerateOptions
    ): AsyncGenerator<StreamChunk> {
        if (!this.provider) {
            throw new Error('Gemini provider not configured. Please set GEMINI_API_KEY.');
        }
        yield* this.provider.generateStream(messages, options);
    }
}

// Singleton instance
export const providerManager = new ProviderManager();
