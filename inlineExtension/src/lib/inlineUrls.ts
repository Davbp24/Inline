/** Hosted production origin — Chrome Web Store builds use this by default. */
export const INLINE_PRODUCTION_ORIGIN = 'https://useinline.vercel.app'

/** Next.js app — /api/clip, /api/ai/*, /api/tts, etc. */
export const DEFAULT_WEB_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : INLINE_PRODUCTION_ORIGIN

/**
 * Annotation API origin. In production the extension targets the web app, which
 * rewrites `/api/annotations` to the Express backend via ANNOTATION_API_ORIGIN.
 */
export const DEFAULT_BACKEND_URL = import.meta.env.DEV
  ? 'http://localhost:3030'
  : INLINE_PRODUCTION_ORIGIN
