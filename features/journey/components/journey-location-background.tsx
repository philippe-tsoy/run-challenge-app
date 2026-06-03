"use client";

import Image from "next/image";

import { resolveJourneyImagePath } from "@/lib/constants/journey-images";

type JourneyLocationBackgroundProps = {
  imageUrl: string | null;
  nodeName: string;
  children: React.ReactNode;
};

export function JourneyLocationBackground({
  imageUrl,
  nodeName,
  children,
}: JourneyLocationBackgroundProps) {
  const src = resolveJourneyImagePath(imageUrl, nodeName);

  if (!src) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/45" />
      </div>
      <div className="relative z-10">{children}</div>
    </>
  );
}
