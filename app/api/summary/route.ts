import { NextRequest, NextResponse } from "next/server";

// Generate wrapped story from GitHub stats
function generateWrappedStory(
  user: { login?: string; name?: string },
  commitCount: number,
  totalPRs: number,
  totalIssues: number,
  topLanguage: string
): string[] {
  const username = user.login || user.name || "Developer";
  const stories: string[] = [];

  stories.push(
    `Welcome to ${username}'s GitHub Wrapped 2025! This year has been an incredible coding journey.`
  );

  if (commitCount > 0) {
    stories.push(
      `You've made ${commitCount} commit${
        commitCount !== 1 ? "s" : ""
      } this year, each one a step forward in your coding adventure. Your dedication to building and improving is truly inspiring!`
    );
  } else {
    stories.push(
      `While you haven't made public commits this year, your journey in code is just beginning. Every developer starts somewhere!`
    );
  }

  if (totalPRs > 0 || totalIssues > 0) {
    stories.push(
      `You opened ${totalPRs} pull request${
        totalPRs !== 1 ? "s" : ""
      } and ${totalIssues} issue${
        totalIssues !== 1 ? "s" : ""
      }, contributing to the open source community and making the developer world a better place.`
    );
  }

  if (topLanguage && topLanguage !== "N/A") {
    stories.push(
      `Your top language this year was ${topLanguage}, showing where your coding passion truly lies. Keep building amazing things!`
    );
  }

  stories.push(
    `Here's to another year of code, commits, and collaboration. Keep pushing forward! 🚀`
  );

  return stories;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { user, commitCount, totalPRs, totalIssues, topLanguage } = data;

    if (
      !user ||
      commitCount === undefined ||
      totalPRs === undefined ||
      totalIssues === undefined ||
      !topLanguage
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate wrapped story from GitHub stats
    const story = generateWrappedStory(
      user,
      commitCount,
      totalPRs,
      totalIssues,
      topLanguage
    );

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
