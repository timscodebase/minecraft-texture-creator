import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minecraft Texture Creator",
    short_name: "MTC",
    description: "Online tool to create Minecraft textures in your browser", // Good to have a description for install prompts
    start_url: "/",
    display: "standalone",
    background_color: "#170a01",
    theme_color: "#025406",
    display_override: ["window-controls-overlay"],
    icons: [
      // Your primary icons for the PWA manifest
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", // Use "maskable" for maskable icons
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Use "maskable" for maskable icons
      },
      // You can also include other specific icon sizes that match your <link> tags
      // For instance, if you have a 96x96 PNG specific to the manifest
      {
        src: "/favicon/favicon-96x96.png", // This matches your <link> tag
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      // If you want to include the SVG in the manifest (recommended for scalability)
      {
        src: "/favicon/favicon.svg",
        sizes: "any", // 'any' is correct for SVG as it scales
        type: "image/svg+xml",
        purpose: "any",
      },
      // Note: favicon.ico and apple-touch-icon.png are primarily handled by <link> tags
    ],
    // Add your screenshots for richer install UI (as discussed in previous turn)
    screenshots: [
      {
        src: "/screenshot-1.png", // Replace with your actual screenshot path
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Your App's Desktop Home Screen",
      },
      {
        src: "/screenshot-2.png", // Replace with your actual screenshot path
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow", // Or omit form_factor for mobile defaults
        label: "Your App's Mobile Profile View",
      },
    ],
  };
}
