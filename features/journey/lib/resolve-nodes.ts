import { DEFAULT_EXTENDED_JOURNEY_NODES } from "@/lib/constants/extended-journey-nodes";
import { resolveJourneyImagePath } from "@/lib/constants/journey-images";
import { LOTR_THEME } from "@/lib/constants/journey-nodes";
import type { JourneyNodeDTO, JourneyNodeStatus } from "@/lib/types/journey";

export type DbJourneyNode = {
  id: string;
  name: string;
  description: string | null;
  km_marker: number;
  sort_order: number;
  image_url: string | null;
  map_x: number | null;
  map_y: number | null;
};

export type ExtendedNodeConfig = {
  kmMarker: number;
  name: string;
  mapX?: number;
  mapY?: number;
};

function themeNodeForDbNode(node: DbJourneyNode) {
  return LOTR_THEME.nodes.find(
    (themeNode) =>
      themeNode.kmMarker === Number(node.km_marker) ||
      themeNode.name.toLowerCase() === node.name.toLowerCase(),
  );
}

function parseExtendedNodes(config: Record<string, unknown> | null): ExtendedNodeConfig[] {
  const raw = config?.extended_nodes;
  if (!Array.isArray(raw) || !raw.length) {
    return DEFAULT_EXTENDED_JOURNEY_NODES;
  }

  const parsed: ExtendedNodeConfig[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const kmMarker = Number(record.kmMarker ?? record.km_marker);
    const name = String(record.name ?? "").trim();

    if (!name || Number.isNaN(kmMarker)) {
      continue;
    }

    parsed.push({
      kmMarker,
      name,
      mapX: record.mapX != null ? Number(record.mapX) : undefined,
      mapY: record.mapY != null ? Number(record.mapY) : undefined,
    });
  }

  return parsed.sort((a, b) => a.kmMarker - b.kmMarker);
}

export function resolveJourneyNodes(
  dbNodes: DbJourneyNode[],
  teamDistanceKm: number,
  config: Record<string, unknown> | null,
  options: {
    isActive: boolean;
    targetKm: number;
    today: string;
    endDate: string;
  },
): {
  nodes: JourneyNodeDTO[];
  extendedNodes: JourneyNodeDTO[];
  currentNode: JourneyNodeDTO;
  nextNode: JourneyNodeDTO | null;
  progressToNext: number;
  questComplete: boolean;
  extendedUnlocked: boolean;
  showExtendedMarkers: boolean;
} {
  const sorted = [...dbNodes].sort(
    (a, b) => Number(a.km_marker) - Number(b.km_marker),
  );

  const primaryNodes = sorted.map((node) => mapDbNode(node, teamDistanceKm, false));

  const current =
    [...primaryNodes]
      .reverse()
      .find((node) => teamDistanceKm >= node.kmMarker) ?? primaryNodes[0];

  const next =
    primaryNodes.find((node) => node.kmMarker > teamDistanceKm) ?? null;

  const nodesWithStatus = primaryNodes.map((node) =>
    assignStatus(node, current.id, next?.id ?? null, teamDistanceKm),
  );

  const progressToNext = computeProgressToNext(
    teamDistanceKm,
    current.kmMarker,
    next?.kmMarker ?? null,
  );

  const questComplete = teamDistanceKm >= options.targetKm;
  const challengeEnded = options.endDate < options.today || !options.isActive;
  const extendedUnlocked = challengeEnded && teamDistanceKm >= options.targetKm;
  const showExtendedMarkers =
    teamDistanceKm >= options.targetKm && options.isActive;

  const extendedConfigs = parseExtendedNodes(config);
  const extendedNodes = extendedConfigs.map((configNode, index) => {
    const status: JourneyNodeStatus =
      teamDistanceKm >= configNode.kmMarker ? "passed" : "locked";

    return {
      id: `extended-${configNode.kmMarker}`,
      name: configNode.name,
      subtitle: "Extended journey",
      description: null,
      kmMarker: configNode.kmMarker,
      sortOrder: sorted.length + index + 1,
      mapX: configNode.mapX ?? 96 + index,
      mapY: configNode.mapY ?? 10 - index,
      imageUrl: null,
      status,
      isExtended: true,
    };
  });

  const currentNode =
    nodesWithStatus.find((node) => node.id === current.id) ?? nodesWithStatus[0];
  const nextNode = next
    ? (nodesWithStatus.find((node) => node.id === next.id) ?? null)
    : null;

  return {
    nodes: nodesWithStatus,
    extendedNodes,
    currentNode,
    nextNode,
    progressToNext,
    questComplete,
    extendedUnlocked,
    showExtendedMarkers,
  };
}

function mapDbNode(
  node: DbJourneyNode,
  _teamDistanceKm: number,
  isExtended: boolean,
): JourneyNodeDTO {
  const theme = themeNodeForDbNode(node);
  const subtitle = theme?.subtitle ?? null;
  const description = node.description ?? theme?.description ?? null;

  return {
    id: node.id,
    name: node.name,
    subtitle,
    description,
    kmMarker: Number(node.km_marker),
    sortOrder: node.sort_order,
    mapX: Number(node.map_x ?? theme?.map.x ?? 50),
    mapY: Number(node.map_y ?? theme?.map.y ?? 50),
    imageUrl:
      resolveJourneyImagePath(node.image_url, node.name) ??
      theme?.image ??
      null,
    status: "locked",
    isExtended,
  };
}

function assignStatus(
  node: JourneyNodeDTO,
  currentId: string,
  nextId: string | null,
  teamDistanceKm: number,
): JourneyNodeDTO {
  let status: JourneyNodeStatus = "locked";

  if (node.id === currentId) {
    status = "current";
  } else if (nextId && node.id === nextId) {
    status = "next";
  } else if (teamDistanceKm >= node.kmMarker) {
    status = "passed";
  }

  return { ...node, status };
}

function computeProgressToNext(
  teamDistanceKm: number,
  currentKm: number,
  nextKm: number | null,
): number {
  if (nextKm === null) {
    return 1;
  }

  const segment = nextKm - currentKm;
  if (segment <= 0) {
    return 1;
  }

  return Math.min(1, Math.max(0, (teamDistanceKm - currentKm) / segment));
}
