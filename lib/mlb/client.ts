const BASE = "https://statsapi.mlb.com/api/v1";

async function mlbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (+https://baseball-beta-sepia.vercel.app)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`MLB API ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

import type {
  MlbAwardsResponse,
  MlbHittingStat,
  MlbPersonResponse,
  MlbPitchingStat,
  MlbPlayerListResponse,
  MlbStatsResponse,
} from "./types";

export function getPerson(id: string | number) {
  return mlbFetch<MlbPersonResponse>(`/people/${id}`);
}

export function getCareerHitting(id: string | number) {
  return mlbFetch<MlbStatsResponse<MlbHittingStat>>(
    `/people/${id}/stats?stats=career&group=hitting`,
  );
}

export function getCareerPitching(id: string | number) {
  return mlbFetch<MlbStatsResponse<MlbPitchingStat>>(
    `/people/${id}/stats?stats=career&group=pitching`,
  );
}

export function getYearByYearHitting(id: string | number) {
  return mlbFetch<MlbStatsResponse<MlbHittingStat>>(
    `/people/${id}/stats?stats=yearByYear&group=hitting`,
  );
}

export function getYearByYearPitching(id: string | number) {
  return mlbFetch<MlbStatsResponse<MlbPitchingStat>>(
    `/people/${id}/stats?stats=yearByYear&group=pitching`,
  );
}

export function getAwards(id: string | number) {
  return mlbFetch<MlbAwardsResponse>(`/people/${id}/awards`);
}

export function getAllPlayers(season: number) {
  return mlbFetch<MlbPlayerListResponse>(`/sports/1/players?season=${season}`);
}
