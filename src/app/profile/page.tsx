"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import { checkAuth, signOut, getUserHistory, User, updateProfile } from "@/utils/authUtils";

interface MentorHistory {
  id: string;
  created_at: string;
  prompt: string;
  advice: string;
  imageUrl?: string;
  audioUrl?: string;
  imagePrompt?: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MentorHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Check for user session
    const checkUserAuth = () => {
      try {
        const session = checkAuth();
        if (session) {
          setUser(session.user);
          setNewUsername(session.user.username);
        } else {
          // No session found, redirect to auth
          router.push("/auth");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
        router.push("/auth");
      }
    };

    checkUserAuth();
  }, [router]);

  useEffect(() => {
    // Fetch user's mentor history if user exists
    const fetchHistory = () => {
      if (!user) return;

      try {
        const userHistory = getUserHistory();
        setHistory(userHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [user]);

  const handleSignOut = () => {
    try {
      signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (newUsername.length < 3) {
      setUpdateError("Username must be at least 3 characters");
      return;
    }
    
    setLoading(true);
    setUpdateError("");
    setUpdateSuccess(false);
    
    try {
      await updateProfile(user.id, { username: newUsername });
      setUser({ ...user, username: newUsername });
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      setUpdateError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">Loading your profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            Your Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:col-span-1">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {user?.username || "User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {updateError && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {updateError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                              text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setUpdateError("");
                      setNewUsername(user?.username || "");
                    }}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                              hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {updateSuccess && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                    Profile updated successfully!
                  </div>
                )}
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50
                            font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50
                            font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              Your Action Plan History
            </h3>

            {history.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  You haven&apos;t generated any career advice yet. Go to the create page to get started!
                </p>
                <Link href="/create" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
                  Create your first action plan
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg">
                          <Image 
                            src={item.imageUrl} 
                            alt="Career advice infographic" 
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-gray-800 dark:text-white font-medium line-clamp-1">
                            {item.prompt}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-2">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {/* Display only the first paragraph of advice, removing markdown formatting */}
                          {item.advice && typeof item.advice === 'string' 
                            ? (item.advice.split('\n\n')[0] || '')
                                .replace(/^#+\s+/g, '') // Remove markdown headers (###, ##, #)
                                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers but keep the text
                                .replace(/\*(.*?)\*/g, '$1') // Remove italic markers but keep the text
                            : 'Career advice'
                          }
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          <Link 
                            href={`/results?id=${item.id}`}
                            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline flex items-center"
                          >
                            <span>View Full Plan</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Link>
                          
                          {item.audioUrl && (
                            <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                              </svg>
                              Audio
                            </span>
                          )}
                          
                          {item.imageUrl && (
                            <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              Visual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/create" className="block w-full">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                              text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl 
                              transition duration-300 transform hover:-translate-y-1 
                              flex items-center justify-center">
              <span className="mr-2 text-lg">Create New Action Plan</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
        </div>
      </main>
    </PageLayout>
  );
}
