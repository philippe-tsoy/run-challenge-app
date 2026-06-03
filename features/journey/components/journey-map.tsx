"use client";

import Image from "next/image";
import { Footprints } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  buildCurvedSegmentPath,
  buildCurvedTrailPath,
  interpolatePoint,
} from "@/features/journey/lib/map-path";
import { Button } from "@/components/ui/button";
import type { JourneyNodeDTO } from "@/lib/types/journey";

type JourneyMapProps = {
  nodes: JourneyNodeDTO[];
  extendedNodes: JourneyNodeDTO[];
  showExtendedMarkers: boolean;
  currentNodeId: string;
  nextNodeId: string | null;
  progressToNext: number;
  teamDistanceKm: number;
};

function nodePosition(node: JourneyNodeDTO) {
  return {
    left: `${node.mapX}%`,
    top: `${node.mapY}%`,
  };
}

function toPoint(node: JourneyNodeDTO) {
  return { x: node.mapX, y: node.mapY };
}

const LEG_PROGRESS_ANIMATION_MS = 1200;

function useAnimatedLegProgress(
  targetPercent: number,
  legKey: string | null,
): number {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const prevLegKey = useRef<string | null>(null);

  useEffect(() => {
    if (!legKey) {
      setAnimatedPercent(0);
      prevLegKey.current = null;
      return;
    }

    const legChanged = prevLegKey.current !== legKey;
    prevLegKey.current = legKey;

    if (legChanged) {
      setAnimatedPercent(0);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        setAnimatedPercent(targetPercent);
        return;
      }

      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedPercent(targetPercent);
        });
      });

      return () => cancelAnimationFrame(frame);
    }

    setAnimatedPercent(targetPercent);
  }, [targetPercent, legKey]);

  return animatedPercent;
}

export function JourneyMap({
  nodes,
  extendedNodes,
  showExtendedMarkers,
  currentNodeId,
  nextNodeId,
  progressToNext,
  teamDistanceKm,
}: JourneyMapProps) {
  const [previewNode, setPreviewNode] = useState<JourneyNodeDTO | null>(null);
  const gradientId = useId().replace(/:/g, "");
  const glowId = `glow-${gradientId}`;
  const trailActiveId = `trail-active-${gradientId}`;
  const trailMutedId = `trail-muted-${gradientId}`;

  const visibleExtended = showExtendedMarkers ? extendedNodes : [];
  const allNodes = [...nodes, ...visibleExtended];

  const current = nodes.find((node) => node.id === currentNodeId);
  const next = nextNodeId
    ? nodes.find((node) => node.id === nextNodeId)
    : null;

  const mainTrailPath = useMemo(
    () => buildCurvedTrailPath(nodes.map(toPoint)),
    [nodes],
  );

  const progressPoint =
    current && next
      ? interpolatePoint(toPoint(current), toPoint(next), progressToNext)
      : null;

  const kmToNext = next
    ? Math.max(0, next.kmMarker - teamDistanceKm)
    : null;

  const legTotalKm =
    current && next ? Math.max(0, next.kmMarker - current.kmMarker) : null;

  const legProgressPercent =
    legTotalKm && legTotalKm > 0
      ? Math.min(100, Math.max(0, progressToNext * 100))
      : 0;

  const legKey = current && next ? `${current.id}:${next.id}` : null;
  const animatedLegProgress = useAnimatedLegProgress(
    legProgressPercent,
    legKey,
  );

  useEffect(() => {
    if (!previewNode) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewNode(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewNode]);

  return (
    <section className="border-border/80 bg-card relative overflow-hidden rounded-xl border shadow-md">
      <div className="border-border/60 border-b px-4 py-2.5">
        <p className="text-[10px] font-medium tracking-[0.2em] text-amber-800/80 uppercase dark:text-amber-200/70">
          Quest map
        </p>
        <p className="text-sm font-medium">Hobbiton → Rivendell</p>
      </div>

      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,rgba(251,191,36,0.12),transparent_55%),linear-gradient(145deg,rgba(254,243,199,0.45)_0%,rgba(236,253,245,0.25)_40%,rgba(224,242,254,0.35)_100%)] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,rgba(180,83,9,0.15),transparent_55%),linear-gradient(145deg,rgba(69,26,3,0.5)_0%,rgba(6,44,30,0.35)_45%,rgba(12,30,55,0.45)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(120,113,108,0.08) 11px, rgba(120,113,108,0.08) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(120,113,108,0.08) 11px, rgba(120,113,108,0.08) 12px)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(120,53,15,0.12)] dark:shadow-[inset_0_0_80px_rgba(0,0,0,0.45)]"
          aria-hidden
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={trailActiveId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(217 119 6)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id={trailMutedId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(168 162 158)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(120 113 108)" stopOpacity="0.25" />
            </linearGradient>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {mainTrailPath ? (
            <path
              d={mainTrailPath}
              fill="none"
              stroke={`url(#${trailMutedId})`}
              strokeWidth={1.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2.5 2"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {nodes.slice(0, -1).map((node, index) => {
            const target = nodes[index + 1];
            const segmentPath = buildCurvedSegmentPath(
              toPoint(node),
              toPoint(target),
              index,
            );
            const isPassed =
              node.status === "passed" ||
              node.id === currentNodeId ||
              target.status === "passed" ||
              target.id === currentNodeId ||
              target.id === nextNodeId;

            if (!isPassed) {
              return null;
            }

            return (
              <path
                key={`active-${node.id}-${target.id}`}
                d={segmentPath}
                fill="none"
                stroke={`url(#${trailActiveId})`}
                strokeWidth={1.35}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                filter={`url(#${glowId})`}
              />
            );
          })}

          {current && progressPoint ? (
            <>
              <line
                x1={current.mapX}
                y1={current.mapY}
                x2={progressPoint.x}
                y2={progressPoint.y}
                stroke="rgb(245 158 11)"
                strokeWidth={1}
                strokeDasharray="2 1.5"
                vectorEffect="non-scaling-stroke"
                className="opacity-90"
              />
              <circle
                cx={progressPoint.x}
                cy={progressPoint.y}
                r={1.2}
                className="fill-amber-400"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>

        <div
          className="pointer-events-none absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full border border-amber-900/15 bg-background/70 text-amber-900/70 shadow-sm backdrop-blur-sm dark:border-amber-200/15 dark:text-amber-100/70"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor">
            <path
              strokeWidth="1.5"
              d="M12 3v3m0 12v3M3 12h3m12 0h3"
              strokeLinecap="round"
            />
            <polygon
              points="12,6 14,10 12,9 10,10"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <text
              x="12"
              y="19"
              textAnchor="middle"
              className="fill-current text-[5px] font-bold"
            >
              N
            </text>
          </svg>
        </div>

        {allNodes.map((node) => {
          const isCurrent = node.id === currentNodeId;
          const isNext = node.id === nextNodeId;
          const isPassed = node.status === "passed" || isCurrent;

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={nodePosition(node)}
            >
              <div
                className={[
                  "relative flex flex-col items-center gap-1.5",
                  isCurrent ? "z-20" : isNext ? "z-10" : "z-0",
                ].join(" ")}
              >
                {isCurrent ? (
                  <span
                    className="absolute size-14 animate-ping rounded-full bg-amber-400/25 sm:size-16"
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  disabled={!node.imageUrl}
                  onClick={() => node.imageUrl && setPreviewNode(node)}
                  className={[
                    "relative flex size-11 items-center justify-center overflow-hidden rounded-full border-2 bg-background shadow-md transition-transform sm:size-[3.25rem]",
                    node.imageUrl
                      ? "cursor-zoom-in hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                      : "cursor-default",
                    isCurrent
                      ? "border-amber-500 ring-4 ring-amber-400/35"
                      : isNext
                        ? "border-amber-500/80 border-dashed"
                        : isPassed
                          ? "border-amber-700/50 dark:border-amber-400/40"
                          : "border-stone-400/40 opacity-75",
                    node.isExtended ? "size-9 sm:size-10" : "",
                  ].join(" ")}
                  title={
                    node.imageUrl
                      ? `${node.name} (${node.kmMarker} km) — tap to enlarge`
                      : `${node.name} (${node.kmMarker} km)`
                  }
                  aria-label={
                    node.imageUrl
                      ? `View full image for ${node.name}`
                      : node.name
                  }
                >
                  {node.imageUrl ? (
                    <Image
                      src={node.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="52px"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs font-semibold">
                      {node.name.slice(0, 1)}
                    </span>
                  )}
                </button>
                <span
                  className={[
                    "max-w-[5rem] truncate rounded-full px-2 py-0.5 text-center text-[10px] leading-tight shadow-sm backdrop-blur-sm sm:max-w-[5.5rem] sm:text-xs",
                    isCurrent
                      ? "bg-amber-500/90 font-semibold text-amber-950"
                      : isNext
                        ? "bg-background/90 text-foreground font-medium"
                        : "bg-background/75 text-muted-foreground",
                  ].join(" ")}
                >
                  {node.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {next && kmToNext !== null && current && legTotalKm !== null ? (
        <div className="border-border/60 space-y-2 border-t px-4 py-3">
          <div className="relative pt-7">
            <div
              className="bg-muted relative h-2.5 overflow-visible rounded-full"
              role="progressbar"
              aria-valuenow={legProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress from ${current.name} to ${next.name}`}
            >
              <div
                className="pointer-events-none absolute bottom-full z-10 mb-0.5 -translate-x-1/2 transition-[left] ease-out motion-reduce:transition-none"
                style={{
                  left: `${animatedLegProgress}%`,
                  transitionDuration: `${LEG_PROGRESS_ANIMATION_MS}ms`,
                }}
                aria-hidden
              >
                <span className="flex size-7 items-center justify-center rounded-full border border-amber-500/40 bg-amber-50 shadow-sm dark:bg-amber-950/80">
                  <Footprints
                    className="size-4 text-amber-700 dark:text-amber-300"
                    strokeWidth={2.25}
                  />
                </span>
              </div>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-[width] ease-out motion-reduce:transition-none"
                style={{
                  width: `${animatedLegProgress}%`,
                  transitionDuration: `${LEG_PROGRESS_ANIMATION_MS}ms`,
                }}
              />
            </div>
          </div>
          <p className="text-center text-sm font-medium">
            <span className="text-foreground">{kmToNext.toFixed(1)} km</span>
            <span className="text-muted-foreground font-normal">
              {" "}
              to {next.name}
            </span>
          </p>
          <p className="text-muted-foreground text-center text-xs">
            {current.name} → {next.name} ·{" "}
            {(legTotalKm - kmToNext).toFixed(1)} / {legTotalKm.toFixed(0)} km on
            this leg ({legProgressPercent.toFixed(0)}%)
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground border-t px-4 py-3 text-center text-sm">
          The fellowship has reached the final destination
        </p>
      )}

      <p className="text-muted-foreground border-t px-4 py-2.5 text-xs">
        Follow the golden trail — brighter paths show ground the fellowship has
        covered
        {showExtendedMarkers ? " · extended markers beyond 500 km" : ""}
        {" · "}
        Tap a marker photo to enlarge
      </p>

      {previewNode?.imageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-image-preview-title"
          onClick={() => setPreviewNode(null)}
        >
          <div
            className="bg-card w-full max-w-sm rounded-xl border p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative mx-auto aspect-square w-full max-w-[min(100%,20rem)] overflow-hidden rounded-lg border">
              <Image
                src={previewNode.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 320px"
                priority
              />
            </div>
            <h2
              id="journey-image-preview-title"
              className="mt-4 text-center text-lg font-semibold"
            >
              {previewNode.name}
            </h2>
            {previewNode.subtitle ? (
              <p className="text-muted-foreground text-center text-sm">
                {previewNode.subtitle}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-1 text-center text-xs">
              {previewNode.kmMarker} km
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setPreviewNode(null)}
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
