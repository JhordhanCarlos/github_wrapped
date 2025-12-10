"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  const handleLogin = () => {
    // Sign in with GitHub - will always prompt for authorization
    // since we clear session on root route
    signIn("github", {
      callbackUrl: "/wrapped",
      redirect: true,
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Login with GitHub
    </button>
  );
}
