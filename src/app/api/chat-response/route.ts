import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUser } from '@/utils/authUtils';

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

    const { messages, generateVisual = false, generateAudio = false, userField = '', userId = '' } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Valid message history is required' },
        { status: 400 }
      );
    }

    // Extract user's field from messages if not provided
    let detectedField = userField;
    if (!detectedField) {
      // Look for field mentions in user messages
      for (const msg of messages) {
        if (msg.type === 'user') {
          const content = msg.content.toLowerCase();
          
          // Check for explicit field mentions
          const fieldPatterns = [
            { pattern: /(?:i am|i'm|as) an? (software|web|frontend|backend|full.?stack) (developer|engineer)/i, field: 'software development' },
            { pattern: /(?:i am|i'm|as) an? (ux|ui|product|graphic|visual) (designer)/i, field: 'design' },
            { pattern: /(?:i am|i'm|as) an? (data scientist|data analyst|machine learning|ml|ai)/i, field: 'data science' },
            { pattern: /(?:i am|i'm|as) an? (marketing|seo|content|social media)/i, field: 'marketing' },
            { pattern: /(?:i am|i'm|as) an? (project manager|product manager|scrum master|agile coach)/i, field: 'project management' },
            { pattern: /(?:i am|i'm|as) an? (finance|accounting|financial)/i, field: 'finance' },
            { pattern: /(?:i am|i'm|as) an? (hr|human resources|talent|recruiting)/i, field: 'human resources' },
            { pattern: /(?:i am|i'm|as) an? (sales|business development|account)/i, field: 'sales' },
            { pattern: /(?:i am|i'm|as) an? (teacher|professor|educator|instructor)/i, field: 'education' },
            { pattern: /(?:i am|i'm|as) an? (healthcare|doctor|nurse|medical)/i, field: 'healthcare' },
            { pattern: /(?:i am|i'm|as) an? (legal|lawyer|attorney)/i, field: 'legal' },
            { pattern: /(?:i work|working) in (software|tech|design|marketing|finance|healthcare|education|legal|sales)/i, field: (match: any) => match[1].toLowerCase() },
            { pattern: /(?:my field is|my industry is|my sector is) (software|tech|design|marketing|finance|healthcare|education|legal|sales)/i, field: (match: any) => match[1].toLowerCase() },
          ];
          
          for (const { pattern, field } of fieldPatterns) {
            const match = content.match(pattern);
            if (match) {
              detectedField = typeof field === 'function' ? field(match) : field;
              break;
            }
          }
          
          if (detectedField) break;
        }
      }
    }
    
    // Format messages for OpenAI API
    const formattedMessages = [
      {
        role: 'system' as const,
        content: `You are MiniMentor, an interactive career coach that helps users with career advice in a conversational way.

        ${detectedField ? `The user works in or is interested in the ${detectedField} field. Tailor your advice specifically to this field without explicitly mentioning that you know their field unless they mentioned it directly. Provide industry-specific examples, challenges, opportunities, and resources relevant to ${detectedField}.` : 'Try to identify the user\'s field or interests from the conversation and tailor your advice accordingly.'}

        IMPORTANT GUIDELINES:
        1. Be conversational and friendly, like a helpful mentor having a chat.
        2. Ask clarifying questions to better understand the user's situation before giving advice.
        3. Don't provide a full action plan immediately - build up to it through conversation.
        4. When appropriate, suggest specific, actionable steps (but only after understanding their situation).
        5. Recommend relevant resources when it makes sense in the conversation.
        6. Keep responses concise and focused.
        7. Be directive in your approach - guide the conversation toward practical career advice.
        8. Provide field-specific insights whenever possible.
        9. Reference industry trends, common challenges, and opportunities in the user's field.
        10. Suggest specific skills to develop that are valued in their industry.
        
        If the conversation has progressed enough and you're ready to provide a more structured plan, use markdown formatting:
        - Use "## Action Steps" as a header for action steps
        - Use numbered lists (1., 2., etc.) for steps
        - Use "## Recommended Resources" for resources
        - Format resource names in bold using ** (e.g., **Book:** "Title")
        
        If the user specifically asks for a visual or you think one would be helpful, end your response with:
        VISUAL: [brief description of a helpful visual related to your advice, tailored to their field]
        
        If the user specifically asks for audio narration or you think it would be helpful, end with:
        AUDIO: true`
      },
      ...messages.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    ];

    // Generate chat response
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: formattedMessages,
      max_tokens: 800,
    });

    const responseText = response.choices[0].message.content || '';
    
    // Extract any visual or audio requests
    let advice = responseText;
    let imagePrompt = '';
    let generateImageFlag = generateVisual;
    let generateAudioFlag = generateAudio;
    
    // Check for visual request
    if (responseText.includes('VISUAL:')) {
      const parts = responseText.split('VISUAL:');
      advice = parts[0].trim();
      imagePrompt = parts[1].split('AUDIO:')[0].trim();
      generateImageFlag = true;
    }
    
    // Check for audio request
    if (responseText.includes('AUDIO: true')) {
      advice = advice.replace('AUDIO: true', '').trim();
      generateAudioFlag = true;
    }

    // Initialize optional content
    let imageUrl = '';
    let audioUrl = '';

    // Generate image if requested
    if (generateImageFlag && imagePrompt) {
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${imagePrompt}. Make it a professional infographic style with clean design, suitable for career advice.`,
          n: 1,
          size: "1024x1024",
        });
        imageUrl = imageResponse.data[0]?.url || '';
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }

    // Generate audio if requested
    if (generateAudioFlag) {
      try {
        const audioResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: "nova",
          input: advice.length > 4000 ? advice.substring(0, 4000) : advice,
        });
        
        // Convert the audio to base64
        const buffer = Buffer.from(await audioResponse.arrayBuffer());
        audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;
      } catch (error) {
        console.error('Error generating audio:', error);
      }
    }

    // Return the response
    return NextResponse.json({
      advice,
      imageUrl,
      audioUrl,
      imagePrompt
    });
  } catch (error: unknown) {
    console.error('Error generating chat response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
