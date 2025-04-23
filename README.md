# MiniMentor - AI-Generated Career Advice

MiniMentor is an AI-powered application that creates personalized career advice with matching visuals and audio narration. Perfect for job seekers looking for guidance and shareable content for their professional networks.

## Features

- **Text Generation**: Get personalized career advice based on your specific situation using OpenAI's GPT models
- **Image Creation**: AI-generated images that match your career advice using DALL-E
- **Audio Narration**: Listen to your advice with high-quality text-to-speech narration
- **Social Sharing**: Easily share your career advice on LinkedIn, Twitter, Facebook and more with customizable messages

## Technologies Used

- **Next.js**: React framework for building the web application
- **OpenAI API**: For text generation (GPT-4), image creation (DALL-E), and audio narration
- **TailwindCSS**: For responsive and modern UI design

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Configuration

This project uses the OpenAI API for text, image, and audio generation. To set up the API key:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key to the file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Restart the development server

You can copy the `.env.example` file to get started.

## How It Works

1. Enter your career question or challenge on the Create page
2. AI generates personalized advice text
3. DALL-E creates a matching background image
4. Text-to-speech converts the advice to audio narration
5. Share your advice on social media platforms with customizable messages

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API](https://platform.openai.com/docs/introduction)
- [TailwindCSS](https://tailwindcss.com/docs)

## Deployment

The application can be deployed on Vercel or any other hosting platform that supports Next.js applications.
