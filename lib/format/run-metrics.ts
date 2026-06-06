export function formatMinSec(decimalMinutes: number): string {
  if (!Number.isFinite(decimalMinutes) || decimalMinutes < 0) {
    return "0:00";
  }

  const totalSeconds = Math.round(decimalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatDurationMinSec(durationMin: number): string {
  return formatMinSec(durationMin);
}

export function formatPaceMinPerKm(paceMinPerKm: number): string {
  return `${formatMinSec(paceMinPerKm)} min/km`;
}
