import HomePageClient from "./components/HomePageClient";

export default async function Home() {
  // Always show login page - client component will handle clearing session
  // This ensures users are asked for GitHub permissions every time

  return <HomePageClient />;
}
