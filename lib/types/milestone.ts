export type MilestoneDTO = {
  id: string;
  challengeId: string;
  journeyNodeId: string;
  nodeName: string;
  kmMarker: number;
  triggeredAt: string;
  title: string;
  message: string;
  confetti: boolean;
  imageUrl: string | null;
};

export type JourneyNodeOption = {
  id: string;
  name: string;
  kmMarker: number;
};
