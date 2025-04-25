# MiniMentor - AI-Generated Career Advice

MiniMentor is an AI-powered application that creates personalized career advice with matching visuals and audio narration. Perfect for job seekers looking for guidance and shareable content for their professional networks.

## Features

- **Text Generation**: Get personalized career advice based on your specific situation using OpenAI's GPT models
- **Image Creation**: AI-generated images that match your career advice using DALL-E
- **Audio Narration**: Listen to your advice with high-quality text-to-speech narration
- **User Authentication**: Create an account with username and email to save your history
- **Profile Management**: Edit your profile and view your advice history
- **Mobile-First Design**: Fully responsive interface that works great on all devices
- **Social Sharing**: Easily share your career advice on LinkedIn, Twitter, Facebook and more with customizable messages
- **Dark Mode**: Toggle between light and dark themes based on your preference

## Technologies Used

- **Next.js**: React framework for building the web application
- **OpenAI API**: For text generation (GPT-4), image creation (DALL-E), and audio narration
- **LocalStorage**: For user authentication and data persistence
- **TailwindCSS**: For responsive and modern UI design

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, set up your environment variables:

1. Copy the `.env.example` file to `.env.local`
2. Add your OpenAI API key

```
OPENAI_API_KEY=your_openai_api_key_here
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Pages

1. **Home** - Introduction to MiniMentor with example prompts and quick access to create new advice
2. **Create** - Form to enter your career question and generate personalized advice
3. **Results** - View your generated advice with image and audio
4. **Profile** - View your saved advice history and edit your profile information
5. **Authentication** - Sign up with username/email or sign in to your account

## How It Works

1. Enter your career question or challenge on the Create page
2. AI generates personalized advice text
3. DALL-E creates a matching background image
4. Text-to-speech converts the advice to audio narration
5. Your advice is saved to your profile (if logged in)
6. Share your advice on social media platforms with customizable messages

## User Authentication

The app includes a simple but functional authentication system:
- Create an account with email, username, and password
- Password visibility toggle for easier input
- Profile editing capabilities
- Secure session management
- View your personalized advice history

## Data Persistence

All data is stored in the browser's localStorage:
- User authentication (email/username/password)
- User profiles and preferences
- Advice history (text, images, audio)

This approach allows the app to function without a backend database while still providing a personalized experience.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API](https://platform.openai.com/docs/introduction)
- [TailwindCSS](https://tailwindcss.com/docs)

## Deployment

The application can be deployed on Vercel or any other hosting platform that supports Next.js applications.
