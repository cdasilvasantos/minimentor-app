# MiniMentor - AI-Generated Career Advice

MiniMentor is an AI-powered application that creates personalized career advice with matching visuals and audio narration. Perfect for job seekers looking for guidance and shareable content for their professional networks.

---

## Features

- **Text Generation**: Get personalized career advice based on your specific situation using OpenAI's GPT models
- **Image Creation**: AI-generated images that match your career advice using DALL-E
- **Audio Narration**: Listen to your advice with high-quality text-to-speech narration
- **User Authentication**: Create an account with username and email to save your history
- **Profile Management**: Edit your profile and view your advice history
- **Mobile-First Design**: Fully responsive interface that works great on all devices
- **Social Sharing**: Easily share your career advice on LinkedIn, Twitter, Facebook, and more
- **Dark Mode**: Toggle between light and dark themes based on your preference

---

## Technologies Used

- **Next.js**: React framework for building the web application
- **OpenAI API**: For text generation (GPT-4), image creation (DALL-E), and audio narration
- **LocalStorage**: For user authentication and data persistence
- **TailwindCSS**: For responsive and modern UI design

---

## Getting Started

First, **clone the repository** and navigate into the project directory:

```bash
git clone https://github.com/your-username/minimentor.git
cd minimentor
```

Then, install the dependencies:

```bash
npm install
```

Set up your environment variables:

1. Copy the `.env.example` file to `.env.local`
2. Add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## Pages

1. **Home** — Introduction to MiniMentor with example prompts and quick access to create new advice
2. **Create** — Form to enter your career question and generate personalized advice
3. **Results** — View your generated advice with matching image and audio narration
4. **Profile** — View your saved advice history and edit your profile information
5. **Authentication** — Sign up with username/email or sign in to your account

---

## How It Works

1. Enter your career question or challenge on the Create page
2. AI generates personalized advice text
3. DALL-E creates a matching background image
4. Text-to-speech converts the advice to audio narration
5. Your advice is saved to your profile (if logged in)
6. Share your advice on social media with customizable messages

---

## User Authentication

The app includes a simple but functional authentication system:
- Create an account with email, username, and password
- Password visibility toggle for easier input
- Profile editing capabilities
- Secure session management
- View your personalized advice history

---

## AI Integration

MiniMentor uses multiple AI-powered features to deliver a personalized user experience:

- Text Generation: OpenAI's GPT-4 model is used to generate customized career advice based on user-submitted prompts.
- Image Creation: OpenAI’s DALL-E API creates unique background images that visually match the generated advice.
- Audio Narration: Text-to-speech services convert the generated advice into high-quality audio narration for accessibility and enhanced user engagement.

All AI functionalities are integrated via the OpenAI API, with prompts dynamically customized based on user input on the Create page.

---

## Data Persistence

All data is stored using the browser's **localStorage**:
- User authentication (email, username, password)
- User profiles and preferences
- Advice history (text, images, audio)

This approach allows the app to function without a backend database while still providing a personalized experience.

---

## Deployment

The application is ready to be deployed on [Vercel](https://vercel.com/) or any hosting platform that supports Next.js applications.  
(Optional: Add your live link here if you deploy it.)

---

## Future Improvements

- Add real database support (e.g., Firebase, Supabase)
- Enhance authentication with OAuth (Google, GitHub sign-in)
- Allow users to customize the AI prompt more deeply
- Improve audio narration quality with custom voice models
- Add notifications or reminder system for career goals

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)