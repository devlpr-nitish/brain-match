import type { Metadata } from "next";
import { Bebas_Neue, DM_Mono, Outfit, Geist } from "next/font/google";
import { ClientThemeProvider } from "@/components/mindmatch/ClientThemeProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Brain Match — Multiplayer Hint & Guess Game",
    template: "%s | Brain Match",
  },
  description: "Brain Match is a realtime two-player hint-and-guess game. Ask for hints, guess smartly, and outplay your opponent.",
  keywords: ["brain match", "multiplayer game", "hint game", "guessing game", "websocket game"],
  openGraph: {
    title: "Brain Match — Multiplayer Hint & Guess Game",
    description: "Play Brain Match with friends in realtime. Ask for hints, make guesses, and compete round by round.",
    type: "website",
    locale: "en_US",
    siteName: "Brain Match",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Match — Multiplayer Hint & Guess Game",
    description: "Realtime two-player hint-and-guess game built with Next.js + WebSockets.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", outfit.variable, dmMono.variable, bebasNeue.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClientThemeProvider>
          {children}
          {/* Global Footer Attribution */}
          <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="text-[0.65rem] tracking-[2px] uppercase text-[var(--muted)] bg-white/60 dark:bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-[var(--border)] pointer-events-auto">
              Made by <a href="https://x.com/devlprnitish" target="_blank" rel="noopener noreferrer" className="text-[var(--cyan)] font-bold hover:underline transition-all hover:text-[var(--pink)]">Nitish</a>
            </div>
          </div>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
