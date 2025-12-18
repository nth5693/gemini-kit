/**
 * Configuration utilities
 * Shared configuration constants and loaders
 */
import * as fs from 'fs';
import * as path from 'path';
/**
 * Default file extensions - expanded to support more languages
 * Used by kit_get_project_context and other tools
 */
export const DEFAULT_EXTENSIONS = [
    '.ts', '.js', '.tsx', '.jsx', // JavaScript/TypeScript
    '.py', // Python
    '.go', // Go
    '.rs', // Rust
    '.java', '.kt', // Java/Kotlin
    '.cpp', '.c', '.h', '.hpp', // C/C++
    '.php', // PHP
    '.rb', // Ruby
    '.swift', // Swift
    '.vue', '.svelte', // Frontend frameworks
    '.json', '.yaml', '.yml', // Config files
    '.md', // Documentation
];
/**
 * Get file extensions - from settings.json or defaults
 * Allows project-specific customization
 */
export function getFileExtensions(projectDir) {
    const settings = loadProjectSettings(projectDir);
    if (settings.fileExtensions && Array.isArray(settings.fileExtensions)) {
        return settings.fileExtensions;
    }
    return DEFAULT_EXTENSIONS;
}
/**
 * Load project settings from .gemini/settings.json
 */
export function loadProjectSettings(projectDir) {
    const settingsPath = path.join(projectDir, '.gemini', 'settings.json');
    if (fs.existsSync(settingsPath)) {
        try {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        }
        catch {
            // Return empty on parse error
        }
    }
    return {};
}
