"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";

interface GitHubData {
  user: {
    login: string;
    name: string;
    avatar_url: string;
  };
  commitCount: number;
  totalPRs: number;
  totalIssues: number;
  topLanguage: string;
}

export default function WrappedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storyCards, setStoryCards] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [githubData, setGitHubData] = useState<GitHubData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const summaryCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchWrappedData();
    }
  }, [status, router]);

  // Scroll to next card
  const scrollToNext = useCallback(() => {
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex < storyCards.length - 1) {
        const nextIndex = prevIndex + 1;
        setTimeout(() => {
          cardRefs.current[nextIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 0);
        return nextIndex;
      }
      return prevIndex;
    });
  }, [storyCards.length]);

  // Scroll to previous card
  const scrollToPrevious = useCallback(() => {
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex > 0) {
        const prevIdx = prevIndex - 1;
        setTimeout(() => {
          cardRefs.current[prevIdx]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 0);
        return prevIdx;
      }
      return prevIndex;
    });
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToNext, scrollToPrevious]);

  // Track scroll position to update current card index
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollPosition = container.scrollTop + container.clientHeight / 2;

      cardRefs.current.forEach((card, index) => {
        if (card) {
          const cardTop = card.offsetTop;
          const cardBottom = cardTop + card.clientHeight;

          if (scrollPosition >= cardTop && scrollPosition < cardBottom) {
            setCurrentCardIndex(index);
          }
        }
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [storyCards.length]);

  // Download summary as image
  const downloadSummary = async () => {
    if (!summaryCardRef.current || !githubData) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(summaryCardRef.current, {
        backgroundColor: "#111827",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `github-wrapped-2025-${githubData.user.login}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setDownloading(false);
    } catch (error) {
      console.error("Error generating image:", error);
      setDownloading(false);
      alert("Failed to generate image. Please try again.");
    }
  };

  const fetchWrappedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch GitHub data
      const githubResponse = await fetch("/api/github");
      if (!githubResponse.ok) {
        throw new Error("Failed to fetch GitHub data");
      }

      const githubData: GitHubData = await githubResponse.json();
      setGitHubData(githubData);

      // Generate summary
      const summaryResponse = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(githubData),
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate summary");
      }

      const { story } = await summaryResponse.json();
      setStoryCards(story || []);
    } catch (err: any) {
      console.error("Error fetching wrapped data:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your wrapped...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center px-4">
          <p className="text-red-400 text-xl mb-4">Error: {error}</p>
          <button
            onClick={fetchWrappedData}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (storyCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <p className="text-white text-xl">No story to display</p>
      </div>
    );
  }

  const isLastCard = (index: number) => index === storyCards.length - 1;

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
    >
      {storyCards.map((card, index) => (
        <div
          key={index}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className="h-screen flex items-center justify-center snap-start snap-always px-4 md:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative"
        >
          <div className="max-w-4xl mx-auto text-center w-full pt-20 pb-12">
            <p className="text-white text-2xl md:text-4xl lg:text-5xl leading-relaxed font-light">
              {card}
            </p>
            {index < storyCards.length - 1 && (
              <button
                onClick={scrollToNext}
                className="mt-12 animate-bounce cursor-pointer hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-2"
                aria-label="Scroll to next card"
              >
                <svg
                  className="w-8 h-8 mx-auto text-white opacity-50 hover:opacity-100 transition-opacity"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </button>
            )}
            {index > 0 && (
              <button
                onClick={scrollToPrevious}
                className="absolute top-16 md:top-20 left-1/2 transform -translate-x-1/2 cursor-pointer hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-2 z-10"
                aria-label="Scroll to previous card"
              >
                <svg
                  className="w-6 h-6 text-white opacity-30 hover:opacity-100 transition-opacity"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </button>
            )}
            {isLastCard(index) && githubData && (
              <div className="mt-12 space-y-6">
                <button
                  onClick={downloadSummary}
                  disabled={downloading}
                  className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
                >
                  {downloading ? (
                    <>
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download Summary Image
                    </>
                  )}
                </button>
                <p className="text-gray-400 text-sm">
                  Share your GitHub Wrapped 2025 with the world!
                </p>
                <button
                  onClick={() => {
                    signOut({
                      callbackUrl: "/",
                      redirect: true,
                    });
                  }}
                  className="mt-6 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Sign Out
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  Clear session and return to home
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Hidden summary card for image generation */}
      {githubData && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <div
            ref={summaryCardRef}
            className="w-[1200px] h-[1600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-16 flex flex-col items-center justify-center text-white"
          >
            <h1 className="text-6xl font-bold mb-8">GitHub Wrapped 2025</h1>
            <div className="mb-12">
              {githubData.user.avatar_url && (
                <img
                  src={githubData.user.avatar_url}
                  alt={githubData.user.login}
                  className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white"
                />
              )}
              <h2 className="text-4xl font-semibold mb-2">
                @{githubData.user.login}
              </h2>
              {githubData.user.name && (
                <p className="text-2xl text-gray-300">{githubData.user.name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-12">
              <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                <div className="text-5xl font-bold mb-2">
                  {githubData.commitCount}
                </div>
                <div className="text-xl text-gray-300">Commits</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                <div className="text-5xl font-bold mb-2">
                  {githubData.totalPRs}
                </div>
                <div className="text-xl text-gray-300">Pull Requests</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                <div className="text-5xl font-bold mb-2">
                  {githubData.totalIssues}
                </div>
                <div className="text-xl text-gray-300">Issues</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                <div className="text-5xl font-bold mb-2">
                  {githubData.topLanguage}
                </div>
                <div className="text-xl text-gray-300">Top Language</div>
              </div>
            </div>
            <div className="text-center text-2xl text-gray-300">
              <p>Your coding journey in 2025</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
