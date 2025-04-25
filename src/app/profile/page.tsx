"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { checkAuth, signOut, getUserHistory, User, updateProfile } from "@/utils/authUtils";

interface MentorHistory {
  id: string;
  created_at: string;
  prompt: string;
  advice: string;
  imageUrl: string;
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
    
    try {
      const updatedUser = await updateProfile(user.id, { username: newUsername });
      setUser(updatedUser);
      setIsEditing(false);
      setUpdateError("");
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error: any) {
      setUpdateError(error.message || "Failed to update profile");
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </span>
              Your MiniMentor History
            </h3>

            {history.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">You haven't created any mentors yet.</p>
                <Link href="/create" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
                  Create your first MiniMentor
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
                        <img 
                          src={item.imageUrl} 
                          alt="Mentor thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-white font-medium mb-1 line-clamp-1">
                          {item.prompt}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {item.advice}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <Link 
                            href={`/results?id=${item.id}`}
                            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                          >
                            View Details
                          </Link>
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
              <span className="mr-2 text-lg">Create New MiniMentor</span>
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
