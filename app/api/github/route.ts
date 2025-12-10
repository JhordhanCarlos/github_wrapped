import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;
    const username = session.user?.name || session.user?.email?.split("@")[0];

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await userResponse.json();
    const login = user.login;

    // Get commits count for 2025
    const commitsResponse = await fetch(
      `https://api.github.com/search/commits?q=author:${login}+author-date:2025-01-01..2025-12-31`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.cloak-preview+json",
        },
      }
    );

    let commitCount = 0;
    if (commitsResponse.ok) {
      const commitsData = await commitsResponse.json();
      commitCount = commitsData.total_count || 0;
    }

    // Get PRs opened in 2025
    const prsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${login}+type:pr+created:2025-01-01..2025-12-31`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let totalPRs = 0;
    if (prsResponse.ok) {
      const prsData = await prsResponse.json();
      totalPRs = prsData.total_count || 0;
    }

    // Get issues opened in 2025
    const issuesResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${login}+type:issue+created:2025-01-01..2025-12-31`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let totalIssues = 0;
    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      totalIssues = issuesData.total_count || 0;
    }

    // Get top 5 most recently updated repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${login}/repos?sort=updated&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let topLanguage = "N/A";
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      const languageCounts: Record<string, number> = {};

      for (const repo of repos) {
        if (repo.language) {
          languageCounts[repo.language] =
            (languageCounts[repo.language] || 0) + 1;
        }
      }

      const sortedLanguages = Object.entries(languageCounts).sort(
        (a, b) => b[1] - a[1]
      );

      if (sortedLanguages.length > 0) {
        topLanguage = sortedLanguages[0][0];
      }
    }

    return NextResponse.json({
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      commitCount,
      totalPRs,
      totalIssues,
      topLanguage,
    });
  } catch (error: any) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
