"use client";

import { useEffect, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import LoginButton from "./LoginButton";

export default function HomePageClient() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hasClearedRef = useRef(false);

  // Clear any existing session when landing on root route
  // This ensures users are always asked for fresh GitHub authorization
  useEffect(() => {
    const clearSession = async () => {
      // Only sign out if there's actually a session and we haven't already cleared
      if ((status === "authenticated" || session) && !isSigningOut && !hasClearedRef.current) {
        hasClearedRef.current = true;
        setIsSigningOut(true);
        
        try {
          // Call our server-side API to clear all cookies first
          await fetch("/api/auth/signout", {
            method: "POST",
            credentials: "include",
          });

          // Then call NextAuth signOut
          await signOut({ 
            redirect: false,
            callbackUrl: "/"
          });

          // Small delay to ensure cookies are cleared, then reload
          setTimeout(() => {
            // Check if we're still on the page before reloading
            if (window.location.pathname === "/") {
              window.location.href = "/?cleared=true";
            }
          }, 200);
        } catch (error) {
          console.error("Error clearing session:", error);
          setIsSigningOut(false);
          hasClearedRef.current = false;
        }
      }
    };

    // Wait for session status to be determined
    if (status !== "loading") {
      clearSession();
    }
  }, [session, status, isSigningOut]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          GitHub Wrapped 2025
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Discover your coding journey this year. See your commits, PRs, issues,
          and more in a beautiful wrapped story.
        </p>
        {isSigningOut ? (
          <div className="flex items-center justify-center gap-2 text-white">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Clearing session...</span>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </main>
  );
}

