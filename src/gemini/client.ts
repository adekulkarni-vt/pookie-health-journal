import { GoogleGenerativeAI } from '@google/generative-ai';

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing GEMINI_API_KEY environment variable. Please check your .env.local file.'
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get the Gemini model instance
 * Placeholder - to be configured with actual model selection
 */
export function getGeminiModel() {
  const client = createGeminiClient();
  return client.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}
