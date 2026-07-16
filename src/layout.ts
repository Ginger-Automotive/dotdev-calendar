import type { ParsedSession, PositionedSession } from './types';

function overlaps(a: ParsedSession, b: ParsedSession): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/**
 * Assign overlapping sessions to side-by-side lanes.
 *
 * Sessions are grouped into clusters of transitively-overlapping items; within
 * a cluster each session takes the lowest lane that is free at its start time,
 * and every session in the cluster shares the cluster's total lane count so
 * widths line up.
 */
export function layoutDay(sessions: ParsedSession[]): PositionedSession[] {
  const sorted = [...sessions].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const result: PositionedSession[] = [];

  let cluster: PositionedSession[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  const flushCluster = (): void => {
    for (const s of cluster) s.laneCount = laneEnds.length;
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };

  for (const s of sorted) {
    if (cluster.length > 0 && s.startMin >= clusterEnd) flushCluster();

    let lane = laneEnds.findIndex((end) => end <= s.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(s.endMin);
    } else {
      laneEnds[lane] = s.endMin;
    }

    cluster.push({ ...s, lane, laneCount: 1, clashing: false });
    clusterEnd = Math.max(clusterEnd, s.endMin);
  }
  flushCluster();

  markClashes(result);
  return result;
}

/** A clash is two wishlisted, non-all-day sessions that overlap in time. */
function markClashes(sessions: PositionedSession[]): void {
  const listed = sessions.filter((s) => s.wishlisted);
  for (let i = 0; i < listed.length; i++) {
    for (let j = i + 1; j < listed.length; j++) {
      const a = listed[i];
      const b = listed[j];
      if (a && b && overlaps(a, b)) {
        a.clashing = true;
        b.clashing = true;
      }
    }
  }
}

export function timeBounds(sessions: ParsedSession[]): { startMin: number; endMin: number } {
  if (sessions.length === 0) return { startMin: 8 * 60, endMin: 18 * 60 };
  let start = Infinity;
  let end = -Infinity;
  for (const s of sessions) {
    start = Math.min(start, s.startMin);
    end = Math.max(end, s.endMin);
  }
  // Snap outward to the hour for a tidy axis.
  return { startMin: Math.floor(start / 60) * 60, endMin: Math.ceil(end / 60) * 60 };
}

export function formatMinutes(min: number): string {
  const hour24 = Math.floor(min / 60);
  const minute = min % 60;
  const meridiem = hour24 >= 12 ? 'pm' : 'am';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0 ? `${hour}${meridiem}` : `${hour}:${String(minute).padStart(2, '0')}${meridiem}`;
}
