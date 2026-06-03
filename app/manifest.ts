import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Run Challenge",
    short_name: "Run",
    description: "Story-driven running challenge for your fellowship",
    start_url: "/app",
    display: "standalone",
    background_color: "#f4faf6",
    theme_color: "#2d6a4f",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
