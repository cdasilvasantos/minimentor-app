"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { signIn, signUp } from "@/utils/authUtils";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        await signUp(email, password, username);
        await signIn(email, password);
        router.push("/profile");
      } else {
        await signIn(email, password);
        router.push("/profile");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div className="relative w-full">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 pt-5 pb-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all 
                         peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                         peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
            >
              Email
            </label>
          </div>

          {/* Username */}
          {isSignUp && (
            <div className="relative w-full">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={3}
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all 
                           peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                           peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
              >
                Username
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Username must be at least 3 characters
              </p>
            </div>
          )}

          {/* Password */}
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 pt-5 pb-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all 
                         peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                         peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
            >
              Password
            </label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-4 right-3 flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {isSignUp && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                      text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg 
                      transition duration-300 flex items-center justify-center"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex justify-center items-center text-indigo-600 dark:text-indigo-400 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
