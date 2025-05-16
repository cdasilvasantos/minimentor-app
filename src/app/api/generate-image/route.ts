import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { messageId, conversationContext, messageContent } = await request.json();

    if (!messageContent) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Generate an image prompt based on the conversation
    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI that creates descriptive prompts for image generation based on career advice conversations.
          
          Given a conversation about career advice, create a detailed, visual prompt that would make a good infographic or visual representation of the key advice.
          
          Your prompt should:
          1. Be detailed and descriptive (around 50-100 words)
          2. Focus on the most important career advice points
          3. Describe a professional, clean visual style appropriate for career advice
          4. Include suggestions for visual elements, colors, and layout
          5. Be suitable for DALL-E image generation
          
          Return ONLY the prompt text without any additional commentary or explanation.`
        },
        {
          role: 'user',
          content: `Here is the conversation context:\n${conversationContext}\n\nCreate an image generation prompt based on this career advice conversation.`
        }
      ],
      max_tokens: 300,
    });

    const imagePrompt = promptResponse.choices[0].message.content || '';
    
    // Generate the image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${imagePrompt}. Make it a professional infographic style with clean design, suitable for career advice.`,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data[0]?.url || '';

    // Return the response
    return NextResponse.json({
      imageUrl,
      imagePrompt
    });
  } catch (error: unknown) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
