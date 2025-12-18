/**
 * Configuration utilities
 * Shared configuration constants and loaders
 */
/**
 * Default file extensions - expanded to support more languages
 * Used by kit_get_project_context and other tools
 */
export declare const DEFAULT_EXTENSIONS: string[];
/**
 * Project settings interface
 */
export interface ProjectSettings {
    fileExtensions?: string[];
    [key: string]: unknown;
}
/**
 * Get file extensions - from settings.json or defaults
 * Allows project-specific customization
 */
export declare function getFileExtensions(projectDir: string): string[];
/**
 * Load project settings from .gemini/settings.json
 */
export declare function loadProjectSettings(projectDir: string): ProjectSettings;
