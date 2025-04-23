import { NextResponse } from 'next/server';
import { generateAdviceAndImageConcept, generateImage, generateAudioNarration } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Step 1: Generate advice text and image concept
    const { advice, imagePrompt } = await generateAdviceAndImageConcept(prompt);

    // Step 2: Generate image using DALL-E
    const imageUrl = await generateImage(imagePrompt);

    // Step 3: Generate audio narration
    const audioUrl = await generateAudioNarration(advice);

    // Return all generated content
    return NextResponse.json({
      advice,
      imageUrl,
      audioUrl,
      imagePrompt
    });
  } catch (error: any) {
    console.error('Error generating advice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate advice' },
      { status: 500 }
    );
  }
}
