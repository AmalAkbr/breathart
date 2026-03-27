// backend/src/services/index.js
// Re-export all services for convenient importing

export * as examService from './examService.js';
export * as authService from './authService.js';
export * as videoService from './videoService.js';
export * as uploadService from './uploadService.js';

export { default as emailService } from './emailService.js';
