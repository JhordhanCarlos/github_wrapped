import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true });

    // Get all possible NextAuth cookie names
    // NextAuth uses different cookie names based on environment
    const allCookies = cookieStore.getAll();
    
    // Clear all cookies that might be related to NextAuth
    allCookies.forEach((cookie) => {
      const name = cookie.name;
      // Check if it's a NextAuth cookie
      if (
        name.includes("next-auth") ||
        name.includes("authjs") ||
        name.includes("session-token") ||
        name.includes("csrf-token")
      ) {
        // Delete the cookie by setting it to expire in the past
        response.cookies.set(name, "", {
          expires: new Date(0),
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: undefined, // Clear for current domain
        });
      }
    });

    return response;
  } catch (error) {
    console.error("Error clearing session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear session" },
      { status: 500 }
    );
  }
}

