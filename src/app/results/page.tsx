"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import SocialShare from "@/components/SocialShare";
import { getUserHistory } from "@/utils/authUtils";

interface MentorData {
  id?: string;
  prompt?: string;
  advice: string;
  imageUrl: string;
  audioUrl: string;
  imagePrompt?: string;
  created_at?: string;
}

// Component that uses useSearchParams
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mentorData, setMentorData] = useState<MentorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Check if we're viewing a specific result from history
    const resultId = searchParams.get("id");
    
    if (resultId) {
      // Get the result from history
      const history = getUserHistory();
      const result = history.find(item => item.id === resultId);
      
      if (result) {
        setMentorData(result);
        setIsLoading(false);
        return;
      }
    }
    
    // Otherwise, retrieve the most recently generated content from localStorage
    const storedData = localStorage.getItem("mentorData");
    
    if (!storedData) {
      router.push("/create");
      return;
    }
    
    try {
      const data = JSON.parse(storedData);
      
      // Check if we're in minimal data mode
      const isMinimalMode = localStorage.getItem("minimalDataMode") === "true";
      if (isMinimalMode) {
        // Show a notification that some content couldn't be stored
        setError("Due to storage limitations, images and audio couldn't be saved. Only the text advice is available.");
        // Clear the flag
        localStorage.removeItem("minimalDataMode");
      }
      
      // Check if audio was generated but not stored
      const audioGeneratedButNotStored = localStorage.getItem("audioGeneratedButNotStored") === "true";
      if (audioGeneratedButNotStored) {
        // Show a notification that audio couldn't be stored
        setError("Due to storage limitations, the audio narration couldn't be saved.");
        // Clear the flag
        localStorage.removeItem("audioGeneratedButNotStored");
      }
      
      setMentorData(data);
    } catch (err) {
      console.error("Failed to parse mentor data:", err);
      router.push("/create");
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    // Initialize audio element when mentorData is available
    if (mentorData?.audioUrl && typeof window !== 'undefined') {
      audioRef.current = new Audio(mentorData.audioUrl);
      
      // Add event listeners
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      
      // Cleanup
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
          audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
          audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        }
      };
    }
  }, [mentorData]);
  
  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  
  const renderAdviceWithFormatting = (advice: string) => {
    if (!advice) return null;
    
    // Process the advice text to handle markdown formatting
    const processedAdvice = advice
      // Replace markdown headers (###) with styled headers
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mt-6 mb-3">$1</h3>')
      // Replace markdown headers (##) with styled headers
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mt-6 mb-3">$1</h2>')
      // Replace markdown headers (#) with styled headers
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-6 mb-4">$1</h1>')
      // Replace bold text (**text**) with styled bold text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      // Replace italic text (*text*) with styled italic text
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      // Replace numbered lists (1. item) with styled lists
      .replace(/^(\d+)\.\s+(.*$)/gm, '<div class="flex items-start mb-2"><span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">$1</span><span>$2</span></div>')
      // Replace bullet points (* item or - item) with styled lists
      .replace(/^[\*\-]\s+(.*$)/gm, '<div class="flex items-start mb-2"><span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-2 h-2 rounded-full mr-2 mt-2 flex-shrink-0"></span><span>$1</span></div>');
    
    // Split by double newlines to separate paragraphs
    const paragraphs = processedAdvice.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // If the paragraph contains HTML (from our replacements above)
          if (paragraph.includes('<h1') || 
              paragraph.includes('<h2') || 
              paragraph.includes('<h3') || 
              paragraph.includes('<span') || 
              paragraph.includes('<div')) {
            return (
              <div 
                key={index} 
                dangerouslySetInnerHTML={{ __html: paragraph }}
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            );
          }
          
          // Regular paragraph
          if (paragraph.trim()) {
            return (
              <p 
                key={index} 
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                {paragraph}
              </p>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">Loading your advice...</p>
        </div>
      </div>
    );
  }
  
  if (!mentorData) {
    return null; // Router will redirect
  }
  
  return (
    <main>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Your Career Advice
        </h2>
        {mentorData.prompt && (
          <p className="text-lg text-gray-600 dark:text-gray-300 ml-12">
            <span className="font-medium">Question:</span> {mentorData.prompt}
          </p>
        )}
        
        {error && (
          <div className="ml-12 mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
        {mentorData.imageUrl && (
          <div className="relative w-full h-72 md:h-96 overflow-hidden">
            <Image 
              src={mentorData.imageUrl} 
              alt="Generated career advice infographic"
              fill
              style={{ objectFit: "cover" }}
              className="transition-all duration-700 hover:scale-105"
              priority
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
                Your Mini Action Plan
              </div>
              {mentorData.audioUrl && (
                <button 
                  onClick={toggleAudio}
                  className={`flex items-center px-3 py-1.5 rounded-full transition-all duration-300 text-sm ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  } border ${isPlaying ? 'border-indigo-600' : 'border-indigo-200 dark:border-indigo-800'} shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                  aria-label={isPlaying ? "Pause audio narration" : "Play audio narration"}
                >
                  {isPlaying ? (
                    <div className="flex items-center">
                      <div className="flex items-end space-x-0.5 mr-2 h-3">
                        <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate]"></div>
                        <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.2s]"></div>
                        <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.3s]"></div>
                        <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.4s]"></div>
                      </div>
                      <span className="font-medium">Playing</span>
                      <span className="relative flex h-2 w-2 ml-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Listen</span>
                    </div>
                  )}
                </button>
              )}
            </h3>
            <div className="prose prose-indigo dark:prose-invert max-w-none">
              {renderAdviceWithFormatting(mentorData.advice)}
            </div>
          </div>
          
          {mentorData.imagePrompt && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </span>
                Image Concept
              </h3>
              <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {mentorData.imagePrompt}
              </p>
            </div>
          )}
          
          {mentorData.created_at && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Created on: {new Date(mentorData.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Social Share Component */}
      {mentorData && <SocialShare advice={mentorData.advice} imageUrl={mentorData.imageUrl} />}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/create" className="flex-1">
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                          text-white font-medium py-4 px-6 rounded-lg shadow-md hover:shadow-lg 
                          transition duration-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Create Another
          </button>
        </Link>
        <Link href="/profile" className="flex-1">
          <button className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 
                           font-medium py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            View Profile
          </button>
        </Link>
      </div>
    </main>
  );
}

// Loading fallback for Suspense
function ResultsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">Loading your advice...</p>
      </div>
    </div>
  );
}

// Main component that wraps ResultsContent in Suspense
export default function Results() {
  return (
    <PageLayout>
      <Suspense fallback={<ResultsLoading />}>
        <ResultsContent />
      </Suspense>
    </PageLayout>
  );
}
