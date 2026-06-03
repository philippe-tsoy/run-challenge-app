import Image from "next/image";

import { getMilestoneImageFromPayload } from "@/lib/constants/journey-images";

type FeedMilestoneImageProps = {
  payload: Record<string, unknown>;
};

export function FeedMilestoneImage({ payload }: FeedMilestoneImageProps) {
  const src = getMilestoneImageFromPayload(payload);

  if (!src) {
    return null;
  }

  const nodeName =
    typeof payload.nodeName === "string" ? payload.nodeName : "Journey location";

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden border-b">
      <Image
        src={src}
        alt={nodeName}
        fill
        className="object-cover"
        sizes="(max-width: 672px) 100vw, 672px"
      />
    </div>
  );
}
