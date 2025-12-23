'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameplayProvider } from "@/contexts/GameplayContext";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <title>Nintendo World!</title>
        <meta name="description" content="Play classic Nintendo, SEGA, PlayStation and DOS games in your browser" />
      </head>
      <body className="antialiased bg-black">
        <AuthProvider>
          <GameplayProvider>
            <Header />
            {children}
          </GameplayProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

