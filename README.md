# 🎁 GitHub Wrapped 2025

> Your coding journey, beautifully wrapped. Discover your GitHub activity for 2025 in a stunning, Spotify Wrapped-style experience.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![NextAuth](https://img.shields.io/badge/NextAuth-4.24-green?style=flat-square)](https://next-auth.js.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📊 **2025 Statistics** - View your commits, PRs, issues, and top language
- 🎨 **Beautiful UI** - Mobile-first design with smooth scroll-snap cards
- 📱 **Responsive Design** - Works perfectly on all devices
- 🖼️ **Download Summary** - Export your wrapped as a shareable image
- 🚀 **No Database** - Stateless architecture, no data persistence
- ⚡ **Fast & Lightweight** - Built with Next.js 14 App Router

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Image Generation**: [html2canvas](https://html2canvas.hertzen.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A GitHub account
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd github_wrapped
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. **Generate NEXTAUTH_SECRET**

   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 GitHub OAuth Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)

2. Click **"New OAuth App"**

3. Fill in the application details:

   - **Application name**: `GitHub Wrapped` (or any name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

4. Click **"Register application"**

5. Copy the **Client ID** and generate a **Client Secret**

6. Add them to your `.env` file

### Production Setup

For production, update your OAuth App settings:

- **Homepage URL**: `https://yourdomain.com`
- **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

## 📁 Project Structure

```
github_wrapped/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth configuration
│   │   │   └── signout/route.ts           # Session clearing endpoint
│   │   ├── github/route.ts               # GitHub data fetching
│   │   └── summary/route.ts                # Story generation
│   ├── components/
│   │   ├── HomePageClient.tsx             # Home page client component
│   │   ├── LoginButton.tsx                # GitHub login button
│   │   └── SessionProvider.tsx             # NextAuth session provider
│   ├── wrapped/
│   │   └── page.tsx                        # Wrapped story display
│   ├── globals.css                        # Global styles
│   ├── icon.svg                           # Favicon
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Landing page
├── types/
│   └── html2canvas.d.ts                   # TypeScript definitions
├── .env.example                           # Environment variables template
├── next.config.js                         # Next.js configuration
├── tailwind.config.js                     # TailwindCSS configuration
└── package.json                           # Dependencies
```

## 🎯 How It Works

1. **Authentication**: Users log in with GitHub OAuth
2. **Data Fetching**: The app fetches 2025 GitHub statistics:
   - Public commits count
   - Pull requests opened
   - Issues opened
   - Top language from recent repos
3. **Story Generation**: Creates a personalized "wrapped" story from the stats
4. **Display**: Shows the story in beautiful, scrollable cards
5. **Export**: Users can download their wrapped as an image

## 🔒 Privacy & Security

- **No Data Storage**: All data is fetched fresh on each visit
- **Session-Based**: Uses JWT tokens, no database required
- **Stateless**: Session expires after 1 hour
- **Auto Sign-Out**: Session is cleared when returning to home page
- **No Persistence**: No data is stored between sessions

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      // Your custom colors
    },
  },
}
```

### Modifying Story Generation

Edit `app/api/summary/route.ts` to customize how stories are generated.

## 🐛 Troubleshooting

### Session Not Clearing

If you're not being asked to login again:

1. Clear your browser cookies
2. Check that `/api/auth/signout` is working
3. Verify `NEXTAUTH_SECRET` is set correctly

### GitHub API Errors

- Ensure your GitHub OAuth app has the correct callback URL
- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Verify your GitHub token has the necessary permissions

### Build Errors

- Make sure all environment variables are set
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Spotify Wrapped](https://www.spotify.com/wrapped/)
- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Made with ❤️ for developers who love their code**
