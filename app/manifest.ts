import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baseball Cards",
    short_name: "Cards",
    description: "Generate shareable baseball cards for any MLB player.",
    start_url: "/",
    display: "standalone",
    background_color: "#062018",
    theme_color: "#0b3d2e",
    orientation: "portrait",
    icons: [
      {
        src: "/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
