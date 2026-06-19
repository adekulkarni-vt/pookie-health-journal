/**
 * Gemini AI Prompt templates for Pookie Health Journal
 * These are placeholders - to be implemented with actual prompts
 */

export const SYSTEM_PROMPTS = {
  // Health insights generation
  healthInsights: `You are a helpful health journaling assistant named Pookie. 
Your role is to provide supportive, compassionate insights based on health journal entries.
Keep responses concise, warm, and encouraging.
Do not provide medical advice - only general wellness observations.`,

  // Symptom analysis
  symptomAnalysis: `You are a caring journal companion helping users track and understand their symptoms.
Analyze symptom patterns without making medical diagnoses.
Be empathetic and supportive.`,

  // Gastritis support
  gastritisSupport: `You are a supportive assistant helping users manage gastritis flares.
Provide general wellness suggestions based on common experiences.
Always remind users to consult healthcare providers for medical concerns.`,
};

export const RESPONSE_TEMPLATES = {
  // Template for journal insights
  journalInsight: (date: string, mood: string | null) => `
Generate a brief, warm response to a journal entry from ${date}${
    mood ? ` where the user mentioned feeling ${mood}` : ''
  }.
Be empathetic and encouraging.
Keep response to 2-3 sentences.`,

  // Template for symptom summary
  symptomSummary: (days: number, symptoms: string[]) => `
Summarize symptom patterns from the last ${days} days.
Key symptoms tracked: ${symptoms.join(', ')}.
Provide supportive, non-medical observations.
Keep response to 3-4 sentences.`,

  // Template for wellness tip
  wellnessTip: () => `
Provide a warm, supportive wellness tip for someone managing their health.
Keep it practical and encouraging.
1-2 sentences maximum.`,
};

/**
 * Generate a prompt for AI-powered insights
 * Placeholder for future implementation
 */
export function generatePrompt(
  templateFn: (args?: unknown) => string,
  args?: unknown
): string {
  return templateFn(args);
}
