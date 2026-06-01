/**
 * Post-Rivendell markers stored in challenges.config.extended_nodes when absent.
 */
export type ExtendedJourneyNodeConfig = {
  kmMarker: number;
  name: string;
  mapX?: number;
  mapY?: number;
};

export const DEFAULT_EXTENDED_JOURNEY_NODES: ExtendedJourneyNodeConfig[] = [
  { kmMarker: 550, name: "Misty Mountains", mapX: 96, mapY: 12 },
  { kmMarker: 600, name: "Caradhras", mapX: 97, mapY: 8 },
  { kmMarker: 650, name: "Moria Gates", mapX: 98, mapY: 5 },
  { kmMarker: 700, name: "Lothlórien", mapX: 99, mapY: 3 },
];
