import './reset.css';
import './base.css';
import './main.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' data-theme='light'>
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
      <body>
        {children}
      </body>
    </html>
  );
}