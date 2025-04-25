"use client";

import { useState, useEffect, Suspense } from "react";
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
      setMentorData(data);
    } catch (err) {
      console.error("Failed to parse mentor data:", err);
      router.push("/create");
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams]);
  
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
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          {mentorData.imageUrl ? (
            <Image 
              src={mentorData.imageUrl} 
              alt="Generated career advice image"
              fill
              style={{ objectFit: "cover" }}
              className="transition-all duration-700 hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Image not available</p>
            </div>
          )}
        </div>
        
        <div className="p-6 md:p-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              Career Advice
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {mentorData.advice}
            </p>
          </div>
          
          {mentorData.audioUrl && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </span>
                Audio Narration
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <audio 
                  controls 
                  className="w-full"
                  src={mentorData.audioUrl}
                  preload="auto"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
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
