"use client";

import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <main>
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Get Personalized Career Advice
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter your career question or challenge, and MiniMentor will create personalized advice 
            with a matching image and audio narration.
          </p>
        </div>

        <div className="mb-12">
          <Link href="/create" className="block w-full">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                              text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl 
                              transition duration-300 transform hover:-translate-y-1 
                              flex items-center justify-center">
              <span className="mr-2 text-lg">Create Your MiniMentor</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mb-3 flex items-center">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                Text
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your career question or challenge, and AI generates a personalized script with actionable advice.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mb-3 flex items-center">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                Photo
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                DALL·E creates a matching background image based on your advice, perfectly capturing the mood and message.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-sm">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mb-3 flex items-center">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                Audio
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Your advice is converted to a conversational tone and narrated with a natural-sounding voice.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Example Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "I'm a software engineering student, give me advice for job interviews.",
              "What's the best way to deal with imposter syndrome in design?",
              "How can I improve my public speaking skills for presentations?",
              "Tips for networking effectively at industry conferences.",
              "How to ask for a promotion after 2 years at the same position?",
              "Strategies for work-life balance in a demanding tech job."
            ].map((question, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <Link href={`/create?prompt=${encodeURIComponent(question)}`}>
                  <div className="flex items-start hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <span className="text-indigo-500 dark:text-indigo-400 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{question}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
