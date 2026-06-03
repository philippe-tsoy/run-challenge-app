/**
 * Journey / milestone images — served from public/journey/ after you download them.
 * Download URLs (verified HTTP 200): public/journey/DOWNLOAD-URLS.md
 */

export type JourneyImageMeta = {
  /** Path under public/ (e.g. /journey/hobbiton.jpg) */
  src: string;
  /** Working URL to download the file yourself */
  downloadUrl: string;
  credit: string;
};

export const JOURNEY_MILESTONE_IMAGES: Record<string, JourneyImageMeta> = {
  hobbiton: {
    src: "/journey/hobbiton.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=85",
    credit: "Dave Hoefler / Unsplash",
  },
  buckland: {
    src: "/journey/buckland.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",
    credit: "v2osk / Unsplash",
  },
  "old-forest": {
    src: "/journey/old-forest.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85",
    credit: "Johannes Plenio / Unsplash",
  },
  bree: {
    src: "/journey/bree.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
    credit: "Kara Eads / Unsplash",
  },
  weathertop: {
    src: "/journey/weathertop.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
    credit: "Simon Berger / Unsplash",
  },
  "ford-of-bruinen": {
    src: "/journey/ford-of-bruinen.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=85",
    credit: "v2osk / Unsplash",
  },
  rivendell: {
    src: "/journey/rivendell.jpg",
    downloadUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85",
    credit: "David Marcu / Unsplash",
  },
};

const NODE_NAME_TO_ID: Record<string, string> = {
  hobbiton: "hobbiton",
  buckland: "buckland",
  "old forest": "old-forest",
  bree: "bree",
  weathertop: "weathertop",
  "ford of bruinen": "ford-of-bruinen",
  rivendell: "rivendell",
};

export function getJourneyImageSrc(nodeId: string): string {
  return JOURNEY_MILESTONE_IMAGES[nodeId]?.src ?? "";
}

export function getJourneyImageForNodeName(nodeName: string): string {
  const id = NODE_NAME_TO_ID[nodeName.trim().toLowerCase()];
  return id ? getJourneyImageSrc(id) : "";
}

/** DB seeds used /journey/*.webp; files on disk are .jpg */
export function resolveJourneyImagePath(
  imageUrl: string | null,
  nodeName: string,
): string | null {
  const byName = getJourneyImageForNodeName(nodeName);
  if (byName) {
    return byName;
  }

  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/journey/") && imageUrl.endsWith(".webp")) {
    return imageUrl.replace(/\.webp$/i, ".jpg");
  }

  return imageUrl;
}

export function getMilestoneImageFromPayload(
  payload: Record<string, unknown>,
): string | null {
  const imageUrl =
    typeof payload.imageUrl === "string" ? payload.imageUrl : null;
  const nodeName =
    typeof payload.nodeName === "string" ? payload.nodeName : "";

  return resolveJourneyImagePath(imageUrl, nodeName);
}
