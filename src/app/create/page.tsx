"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { saveToHistory } from "@/utils/authUtils";

// Create a client component that uses useSearchParams
function CreateMentorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generateVisual, setGenerateVisual] = useState(true);
  const [generateAudio, setGenerateAudio] = useState(true);
  
  // Get prompt from URL if available
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter a question or topic for advice.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/generate-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          generateVisual,
          generateAudio
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate advice");
      }
      
      const data = await response.json();
      
      // Store the generated content in localStorage to pass to the next page
      try {
        // Try to store the full data first
        localStorage.setItem("mentorData", JSON.stringify(data));
        
        // Also save to user history
        saveToHistory({
          prompt,
          advice: data.advice,
          imageUrl: data.imageUrl,
          audioUrl: data.audioUrl,
          imagePrompt: data.imagePrompt
        });
      } catch (storageError) {
        console.warn("Storage quota exceeded when saving full data", storageError);
        
        // If we hit storage limits, try storing without the audio (usually the largest part)
        try {
          const reducedData = {
            ...data,
            audioUrl: "" // Don't store the audio in localStorage
          };
          
          localStorage.setItem("mentorData", JSON.stringify(reducedData));
          
          // Save to history with reduced data
          saveToHistory({
            prompt,
            advice: data.advice,
            imageUrl: data.imageUrl,
            audioUrl: "", // Skip audio in history
            imagePrompt: data.imagePrompt
          });
          
          // Set a flag to indicate audio was generated but not stored
          localStorage.setItem("audioGeneratedButNotStored", "true");
        } catch (secondError) {
          console.warn("Storage still exceeded with reduced data", secondError);
          
          // Last resort: Store only the essential data
          const essentialData = {
            advice: data.advice,
            prompt: prompt,
            // No media content
          };
          
          localStorage.setItem("mentorData", JSON.stringify(essentialData));
          
          // Set a flag to indicate we're in minimal data mode
          localStorage.setItem("minimalDataMode", "true");
        }
      }
      
      // Navigate to the results page
      router.push("/results");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      <div className="md:flex">
        {/* Form Section */}
        <div className="p-6 md:p-8 md:w-3/5">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            Create Your Career Advice
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="prompt" 
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                What specific career question or challenge can I help with?
              </label>
              <textarea
                id="prompt"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                          text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 
                          shadow-sm transition-all duration-200"
                rows={6}
                placeholder="Examples: How do I prepare for a software engineering interview? What skills should I develop to transition into UX design? How can I negotiate a higher salary?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              ></textarea>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Be specific about your career situation, challenges, or goals for a personalized mini action plan.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Optional Enhancements:</h4>
              
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={generateVisual}
                    onChange={() => setGenerateVisual(!generateVisual)}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Generate Visual Infographic</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={generateAudio}
                    onChange={() => setGenerateAudio(!generateAudio)}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Generate Audio Narration</span>
                </label>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                        text-white font-medium py-4 px-6 rounded-lg shadow-md hover:shadow-lg 
                        transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Generating Your Advice...
                </>
              ) : (
                <>
                  <span>Generate Career Advice</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Info Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 md:p-8 md:w-2/5">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">How It Works</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-1">Personalized Mini Action Plan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI analyzes your specific career question and creates a personalized mini action plan with concrete steps and resources.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-1">Visual Infographic</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  DALL·E creates a helpful infographic that visualizes your action steps and key advice points.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-1">Audio Narration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your advice is converted to speech so you can listen to your action plan anytime.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/30">
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">Tips for Better Results:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>Ask specific questions about your career challenges</li>
              <li>Mention your experience level and career stage</li>
              <li>Include your industry or desired field</li>
              <li>Request specific types of advice (e.g., "How to network in tech")</li>
              <li>Ask for resources or tools related to your goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <PageLayout>
      <main>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Get Personalized Career Advice
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter your career question below, and our AI will generate custom advice with matching visuals and audio.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateMentorForm />
        </Suspense>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </PageLayout>
  );
}
