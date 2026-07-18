import type { GeoPoint, MatrixCell, TravelMatrix } from "../geo/geo.service";

/** Matrix cell with a flag marking Haversine estimates (vs real road data). */
export interface RouteCell extends MatrixCell {
  estimated: boolean;
}

export interface OptimizedRoute {
  /** Matrix indices of the visit points, in optimal visiting order. */
  order: number[];
  totalDurationSec: number;
  totalDistanceM: number;
}

/** Average speed used to turn straight-line distance into a rough duration. */
const FALLBACK_SPEED_KMH = 30;
/** Straight-line to road-distance correction for the Haversine fallback. */
const ROAD_WINDING_FACTOR = 1.35;
/** Held-Karp is exact but O(2^n * n^2); beyond this we switch to heuristics. */
const HELD_KARP_MAX_NODES = 13;

export function haversineM(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function estimateCell(a: GeoPoint, b: GeoPoint): RouteCell {
  const distanceM = haversineM(a, b) * ROAD_WINDING_FACTOR;
  const durationSec = (distanceM / 1000 / FALLBACK_SPEED_KMH) * 3600;
  return { distanceM: Math.round(distanceM), durationSec: Math.round(durationSec), estimated: true };
}

/**
 * Produce a complete NxN cost matrix: real Goong cells where available,
 * Haversine estimates for gaps (or the whole matrix when Goong failed).
 */
export function completeMatrix(matrix: TravelMatrix | null, points: GeoPoint[]): RouteCell[][] {
  return points.map((from, i) =>
    points.map((to, j) => {
      if (i === j) return { durationSec: 0, distanceM: 0, estimated: false };
      const cell = matrix?.[i]?.[j];
      if (cell) return { ...cell, estimated: false };
      return estimateCell(from, to);
    }),
  );
}

function tourCost(dur: number[][], order: number[], anchor: number | null): number {
  if (order.length === 0) return 0;
  let cost = 0;
  if (anchor != null) cost += dur[anchor][order[0]];
  for (let i = 0; i + 1 < order.length; i++) cost += dur[order[i]][order[i + 1]];
  if (anchor != null) cost += dur[order[order.length - 1]][anchor];
  return cost;
}

/**
 * Exact TSP via bitmask DP. With an anchor the tour is a roundtrip
 * anchor -> visits -> anchor; without one it is an open path with free endpoints.
 */
function heldKarp(dur: number[][], nodes: number[], anchor: number | null): number[] {
  const m = nodes.length;
  const FULL = 1 << m;
  const dp: Float64Array[] = Array.from({ length: FULL }, () => new Float64Array(m).fill(Infinity));
  const parent: Int8Array[] = Array.from({ length: FULL }, () => new Int8Array(m).fill(-1));

  for (let i = 0; i < m; i++) {
    dp[1 << i][i] = anchor != null ? dur[anchor][nodes[i]] : 0;
  }

  for (let mask = 1; mask < FULL; mask++) {
    for (let j = 0; j < m; j++) {
      if (!(mask & (1 << j))) continue;
      const base = dp[mask][j];
      if (!Number.isFinite(base)) continue;
      for (let k = 0; k < m; k++) {
        if (mask & (1 << k)) continue;
        const next = mask | (1 << k);
        const cost = base + dur[nodes[j]][nodes[k]];
        if (cost < dp[next][k]) {
          dp[next][k] = cost;
          parent[next][k] = j;
        }
      }
    }
  }

  let best = Infinity;
  let bestEnd = 0;
  for (let j = 0; j < m; j++) {
    let cost = dp[FULL - 1][j];
    if (anchor != null) cost += dur[nodes[j]][anchor];
    if (cost < best) {
      best = cost;
      bestEnd = j;
    }
  }

  const reversed: number[] = [];
  let mask = FULL - 1;
  let j = bestEnd;
  while (j !== -1) {
    reversed.push(nodes[j]);
    const prev = parent[mask][j];
    mask ^= 1 << j;
    j = prev;
  }
  return reversed.reverse();
}

function nearestNeighbor(dur: number[][], nodes: number[], anchor: number | null): number[] {
  const remaining = new Set(nodes);
  const order: number[] = [];
  let current: number;

  if (anchor != null) {
    current = anchor;
  } else {
    current = nodes[0];
    order.push(current);
    remaining.delete(current);
  }

  while (remaining.size > 0) {
    let best = -1;
    let bestCost = Infinity;
    for (const node of remaining) {
      const cost = dur[current][node];
      if (cost < bestCost) {
        bestCost = cost;
        best = node;
      }
    }
    order.push(best);
    remaining.delete(best);
    current = best;
  }
  return order;
}

/**
 * Or-opt local search: relocate segments of 1-3 stops. Unlike 2-opt it never
 * reverses a segment, so it stays correct for asymmetric (one-way) matrices.
 */
function orOptImprove(dur: number[][], initial: number[], anchor: number | null): number[] {
  let current = [...initial];
  let cost = tourCost(dur, current, anchor);
  let improved = true;

  while (improved) {
    improved = false;
    for (let segLen = 1; segLen <= 3 && segLen < current.length; segLen++) {
      for (let i = 0; i + segLen <= current.length; i++) {
        const rest = [...current.slice(0, i), ...current.slice(i + segLen)];
        const segment = current.slice(i, i + segLen);
        for (let pos = 0; pos <= rest.length; pos++) {
          if (pos === i) continue;
          const candidate = [...rest.slice(0, pos), ...segment, ...rest.slice(pos)];
          const candidateCost = tourCost(dur, candidate, anchor);
          if (candidateCost + 1e-9 < cost) {
            current = candidate;
            cost = candidateCost;
            improved = true;
          }
        }
      }
    }
  }
  return current;
}

/**
 * Find the best visiting order for `visitIndices`, minimizing total travel
 * duration. `anchorIndex` (the lodging) fixes the start and end of the tour.
 */
export function optimizeRoute(
  cells: RouteCell[][],
  visitIndices: number[],
  anchorIndex: number | null,
): OptimizedRoute {
  const dur = cells.map((row) => row.map((cell) => cell.durationSec));

  let order: number[];
  if (visitIndices.length <= 1) {
    order = [...visitIndices];
  } else if (visitIndices.length <= HELD_KARP_MAX_NODES) {
    order = heldKarp(dur, visitIndices, anchorIndex);
  } else {
    order = orOptImprove(dur, nearestNeighbor(dur, visitIndices, anchorIndex), anchorIndex);
  }

  let totalDurationSec = 0;
  let totalDistanceM = 0;
  const addLeg = (from: number, to: number) => {
    totalDurationSec += cells[from][to].durationSec;
    totalDistanceM += cells[from][to].distanceM;
  };
  if (order.length > 0) {
    if (anchorIndex != null) addLeg(anchorIndex, order[0]);
    for (let i = 0; i + 1 < order.length; i++) addLeg(order[i], order[i + 1]);
    if (anchorIndex != null) addLeg(order[order.length - 1], anchorIndex);
  }

  return {
    order,
    totalDurationSec: Math.round(totalDurationSec),
    totalDistanceM: Math.round(totalDistanceM),
  };
}
