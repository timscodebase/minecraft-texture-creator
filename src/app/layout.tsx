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
      {/* Ensure no whitespace immediately after <html> or before <body> */}
      <head>
        {/*
          IMPORTANT: Ensure there is NO WHITESPACE/NEWLINE
          immediately after <head> or before </head>,
          or between <head> children like this:
        */}
        {/* Favicons */}
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        {/* Apple Touch Icon for iOS home screen */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Minecraft Texture Creator" />
        {/* Web App Manifest for PWA features */}
        <link rel="manifest" href="/manifest.webmanifest" /> 
        {/* Other meta tags, title, etc. */}
        <title>Minecraft Texture Creator</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
