import { LOTR_THEME } from "@/lib/constants/journey-nodes";

export type CelebrationCopy = {
  title: string;
  message: string;
  confetti: boolean;
};

export function getCelebrationForNode(
  nodeName: string,
  kmMarker: number,
  description?: string | null,
): CelebrationCopy {
  const themed = LOTR_THEME.nodes.find(
    (node) =>
      node.kmMarker === Number(kmMarker) ||
      node.name.toLowerCase() === nodeName.toLowerCase(),
  );

  if (themed) {
    return {
      title: themed.celebration.title,
      message: themed.celebration.message,
      confetti: themed.celebration.confetti,
    };
  }

  return {
    title: nodeName,
    message: description ?? "The fellowship has reached a new milestone.",
    confetti: true,
  };
}
