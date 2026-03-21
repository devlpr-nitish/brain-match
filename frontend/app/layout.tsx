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
        <ClientThemeProvider>{children}</ClientThemeProvider>
      </body>
    </html>
  );
}
