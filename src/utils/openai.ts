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
        content: `You are a professional career mentor providing personalized, actionable advice. 
        
        For each user query, generate a structured response with the following components:
        1. A brief 1-2 sentence personalized encouragement related to their situation
        2. 3-5 specific, actionable steps they can take immediately to address their career challenge
        3. 1-2 recommended resources (books, websites, courses, tools) that would be helpful
        
        Format your response with clear section headers using markdown:
        - Start with a brief personalized message (no header needed)
        - Use "## Action Steps" as a header for the action steps section
        - Use numbered lists (1., 2., etc.) for the action steps
        - Use "## Recommended Resources" as a header for the resources section
        - Format resource names in bold using ** (e.g., **Book:** "Title")
        
        Also suggest an infographic concept that would visually represent this advice (described in a single sentence at the end, prefixed with "INFOGRAPHIC CONCEPT:"). The infographic should visualize the key steps or a process, not just be a generic motivational image.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 800,
  });

  const responseText = response.choices[0].message.content || '';
  
  // Extract advice and image concept
  const parts = responseText.split('INFOGRAPHIC CONCEPT:');
  const advice = parts[0].trim();
  const imagePrompt = parts.length > 1 
    ? parts[1].trim() 
    : 'An infographic showing key career steps with icons for each action item, designed in a professional style with a clean layout';

  return { advice, imagePrompt };
}

// Generate image using DALL-E
export async function generateImage(imagePrompt: string) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${imagePrompt} - Create a professional infographic style image that clearly visualizes career advice steps or concepts. The image should be informative, not just decorative, with a clean, modern design that helps understand the advice. Include simple icons or visual elements that represent each step or concept. Use a professional color scheme and make any text highly readable.`,
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
