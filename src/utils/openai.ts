import OpenAI from 'openai';

// Initialize OpenAI client with the provided API key
// Note: For security, we're not hardcoding the API key
// In production, use environment variables or a secure key management solution
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Generate career advice and image concept
export async function generateAdviceAndImageConcept(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a career mentor providing concise, actionable advice. Generate 3-5 sentences of encouraging career advice based on the user\'s prompt. Also suggest an image concept that would complement this advice (described in a single sentence at the end, prefixed with "IMAGE CONCEPT:").'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 500,
  });

  const responseText = response.choices[0].message.content || '';
  
  // Extract advice and image concept
  const parts = responseText.split('IMAGE CONCEPT:');
  const advice = parts[0].trim();
  const imagePrompt = parts.length > 1 ? parts[1].trim() : 'A professional office setting with motivational atmosphere';

  return { advice, imagePrompt };
}

// Generate image using DALL-E
export async function generateImage(imagePrompt: string) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${imagePrompt} - Create a high-quality, professional image suitable for career advice content. The image should be inspirational and motivational.`,
    n: 1,
    size: '1024x1024',
  });

  return response.data[0]?.url || '';
}

// Generate audio narration
export async function generateAudioNarration(text: string) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  });

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString('base64');
  return `data:audio/mp3;base64,${audioBase64}`;
}
