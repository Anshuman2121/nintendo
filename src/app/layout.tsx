import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Nintendo World!",
  description: "Play classic Nintendo, SEGA, PlayStation and DOS games in your browser",
  keywords: ["nintendo", "emulator", "retro games", "NES", "SNES", "N64", "SEGA", "PlayStation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-black">
        {children}
      </body>
    </html>
  );
}
