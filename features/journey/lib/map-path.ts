type Point = { x: number; y: number };

/** Smooth quest trail between waypoints (quadratic segments with slight bend). */
export function buildCurvedTrailPath(points: Point[]): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const bulge = 5;
    const controlX = midX - dy * (bulge / 100);
    const controlY = midY + dx * (bulge / 100);
    path += ` Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  }

  return path;
}

export function buildCurvedSegmentPath(from: Point, to: Point, index: number): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const direction = index % 2 === 0 ? 1 : -1;
  const bulge = 5 * direction;
  const controlX = midX - dy * (bulge / 100);
  const controlY = midY + dx * (bulge / 100);
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

export function interpolatePoint(
  from: Point,
  to: Point,
  progress: number,
): Point {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
