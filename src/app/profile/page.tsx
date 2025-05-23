"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import { checkAuth, signOut, getChatHistory, deleteChatConversation, User, updateProfile, ChatConversation } from "@/utils/authUtils";

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
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
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
    // Fetch user's chat history if user exists
    const fetchHistory = () => {
      if (!user) return;

      try {
        const userChatHistory = getChatHistory();
        setChatHistory(userChatHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [user]);
  
  // Function to handle deleting a chat conversation
  const handleDeleteChat = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      const success = deleteChatConversation(conversationId);
      if (success) {
        // Update the local state to reflect the deletion
        setChatHistory(prev => prev.filter(chat => chat.id !== conversationId));
      } else {
        alert('Failed to delete conversation. Please try again.');
      }
    }
  };

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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                              text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                  className="w-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 
                            text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg transition-colors
                            flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 
                            text-red-700 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition-colors
                            flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 2.586L15.414 9H12V5.586zM5 7a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          
          {/* History Panel */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Chat History</h2>
                </div>
                
                {chatHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No chat history yet. Start chatting with MiniMentor!</p>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((conversation) => (
                      <div key={conversation.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <Link href={`/chat?conversation=${conversation.id}`} className="absolute inset-0 z-10 cursor-pointer" aria-label={`Open conversation: ${conversation.title}`}>
                          <span className="sr-only">Open conversation</span>
                        </Link>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {new Date(conversation.updated_at).toLocaleString()}
                            </p>
                            <h3 className="font-medium text-gray-800 dark:text-white mb-1">{conversation.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {conversation.messages.length} messages
                            </p>
                          </div>
                          <div className="flex space-x-2 relative z-20">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/chat?conversation=${conversation.id}`);
                              }}
                              className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 bg-white dark:bg-gray-800 rounded-full group-hover:shadow-md relative z-20" 
                              aria-label="Continue conversation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteChat(conversation.id);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-gray-800 rounded-full group-hover:shadow-md relative z-20"
                              aria-label="Delete conversation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {conversation.messages.some(m => m.imageUrl) && (
                          <div className="mt-3">
                            <Image 
                              src={conversation.messages.find(m => m.imageUrl)?.imageUrl || ''} 
                              alt="Generated image" 
                              width={200} 
                              height={200} 
                              className="rounded-md object-cover w-full h-32"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/chat" className="block w-full">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                              text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl 
                              transition duration-300 transform hover:-translate-y-1 
                              flex items-center justify-center">
              <span className="mr-2 text-lg">Start Chatting with MiniMentor</span>
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
