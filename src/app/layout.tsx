import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minecraft Texture Creator",
  description: "Online tool to create Minecraft textures in your browser",
  openGraph: {
    title: "Minecraft Texture Creator",
    description: "Online tool to create Minecraft textures in your browser",
    url: "https://minecraft-texture-creator.vercel.app",
    siteName: "Minecraft Texture Creator",
    images: [
      {
        url: "https://minecraft-texture-creator.vercel.app/screenshot-1.png",
        width: 1200,
        height: 630,
        alt: "Minecraft Texture Creator",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
