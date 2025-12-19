/**
 * Gemini-Kit Constants
 * Centralized configuration paths (LOW 7 fix)
 */

import * as os from 'os';
import * as path from 'path';

// Base directory (user's home)
export const HOME_DIR = os.homedir();

// Gemini-Kit directories
export const GEMINI_KIT_DIR = '.gemini-kit';
export const GEMINI_KIT_GLOBAL_DIR = path.join(HOME_DIR, GEMINI_KIT_DIR);

// Subdirectories
export const SESSIONS_SUBDIR = 'sessions';
export const LEARNINGS_SUBDIR = 'learnings';
export const INDEX_SUBDIR = 'index';
export const DIFFS_SUBDIR = 'diffs';
export const ARTIFACTS_SUBDIR = 'artifacts';
export const CHECKPOINTS_SUBDIR = 'checkpoints';

// Full paths (global)
export const SESSIONS_DIR = path.join(GEMINI_KIT_GLOBAL_DIR, SESSIONS_SUBDIR);
export const LEARNINGS_DIR = path.join(GEMINI_KIT_GLOBAL_DIR, LEARNINGS_SUBDIR);
export const INDEX_DIR = path.join(GEMINI_KIT_GLOBAL_DIR, INDEX_SUBDIR);
export const DIFFS_DIR = path.join(GEMINI_KIT_GLOBAL_DIR, DIFFS_SUBDIR);

// Active session pointer file
export const ACTIVE_SESSION_FILE = path.join(GEMINI_KIT_GLOBAL_DIR, 'active-session.json');

// File extensions for indexing
export const DEFAULT_CODE_EXTENSIONS = [
    '.ts', '.js', '.tsx', '.jsx',
    '.py', '.go', '.rs', '.rb',
    '.java', '.kt', '.swift',
    '.c', '.cpp', '.h', '.hpp',
    '.css', '.scss', '.less',
    '.html', '.vue', '.svelte',
    '.json', '.yaml', '.yml', '.toml',
    '.md', '.mdx',
];

// Directories to exclude from indexing
export const DEFAULT_EXCLUDE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    'vendor',
    '__pycache__',
    '.venv',
    'venv',
];

// Limits
export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
export const DEFAULT_MAX_FILES = 100;
export const BATCH_SIZE = 10;

// Timeouts (can be overridden via env vars)
export const GIT_TIMEOUT = parseInt(process.env.GEMINI_KIT_GIT_TIMEOUT || '30000', 10);
export const GH_TIMEOUT = parseInt(process.env.GEMINI_KIT_GH_TIMEOUT || '60000', 10);
