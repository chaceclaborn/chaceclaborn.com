import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { ChatAgent } from "@/components/chat/ChatAgent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Chace Claborn | Propulsion Design Engineer",
    template: "%s | Chace Claborn",
  },
  description: "Professional portfolio of Chace Claborn - Propulsion Design Engineer at Blue Origin, Auburn University graduate specializing in aerospace engineering and rocket propulsion systems.",
  keywords: ["Propulsion Engineer", "Design Engineer", "Blue Origin", "Auburn University", "Aerospace", "Rocket Engines", "Manufacturing"],
  authors: [{ name: "Chace Claborn" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Chace Claborn | Propulsion Design Engineer",
    description: "Professional portfolio of Chace Claborn - Propulsion Design Engineer at Blue Origin",
    url: "https://chaceclaborn.com",
    siteName: "Chace Claborn Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <ChatAgent />
        </Providers>
      </body>
    </html>
  );
}
