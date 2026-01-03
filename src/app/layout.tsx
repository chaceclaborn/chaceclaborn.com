import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

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
    default: "Chace Claborn | Mechanical Engineer",
    template: "%s | Chace Claborn",
  },
  description: "Professional portfolio of Chace Claborn - Mechanical Engineer and propulsion design engineer for turbomachinery. Auburn University graduate specializing in aerospace engineering and rocket propulsion systems.",
  keywords: ["Mechanical Engineer", "Propulsion Engineer", "Turbomachinery", "Auburn University", "Aerospace", "Rocket Engines", "Manufacturing"],
  authors: [{ name: "Chace Claborn" }],
  openGraph: {
    title: "Chace Claborn | Mechanical Engineer",
    description: "Professional portfolio of Chace Claborn - Mechanical Engineer and propulsion design engineer for turbomachinery. Auburn University graduate specializing in aerospace engineering and rocket propulsion systems.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Header />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
