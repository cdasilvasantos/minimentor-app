"use client";

import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <main>
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Your AI Career Coach with Actionable Plans
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ask any career question and get a personalized mini action plan with specific steps, 
            recommended resources, and visual guidance to move your career forward.
          </p>
        </div>

        <div className="mb-12">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-8">
            <Link href="/chat" className="flex-1">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                                text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl 
                                transition duration-300 transform hover:-translate-y-1 
                                flex items-center justify-center">
                <span className="mr-2 text-lg">Start Chatting Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            How Your Mini Action Plan Works
          </h3>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex items-start mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md text-lg font-bold flex-shrink-0">
                    1
                  </div>
                  <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">Personalized Advice</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 ml-13">
                  Ask any career question and receive a customized mini action plan with specific, practical steps you can take immediately.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex items-start mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md text-lg font-bold flex-shrink-0">
                    2
                  </div>
                  <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">Visual Infographic</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 ml-13">
                  Get a helpful infographic that visualizes your action steps and key advice points, making your plan easy to understand and follow.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex items-start mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md text-lg font-bold flex-shrink-0">
                    3
                  </div>
                  <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">Resource Tips</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 ml-13">
                  Discover relevant books, websites, courses, and tools specifically recommended for your career situation and goals.
                </p>
              </div>
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
            Ask About Specific Career Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "How do I prepare for a software engineering interview?",
              "What skills should I develop to transition into UX design?",
              "How can I overcome imposter syndrome in a new tech role?",
              "What's the best way to negotiate a higher salary?",
              "How can I build a professional network in the finance industry?",
              "What should I include in my portfolio as a new graphic designer?"
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
