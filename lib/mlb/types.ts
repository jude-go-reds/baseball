// Minimal shapes from statsapi.mlb.com that this app relies on.
// We type only the fields we use; everything else is left untyped.

export type MlbPersonResponse = {
  people: Array<{
    id: number;
    fullName: string;
    nameSlug?: string;
    active: boolean;
    primaryPosition?: { abbreviation?: string; code?: string };
    mlbDebutDate?: string;
    lastPlayedDate?: string;
  }>;
};

export type MlbHittingStat = {
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  homeRuns?: number;
  rbi?: number;
  hits?: number;
  runs?: number;
  stolenBases?: number;
};

export type MlbPitchingStat = {
  wins?: number;
  losses?: number;
  era?: string;
  whip?: string;
  strikeOuts?: number;
  inningsPitched?: string;
  saves?: number;
};

export type MlbStatsResponse<T> = {
  stats: Array<{
    type?: { displayName?: string };
    group?: { displayName?: string };
    splits: Array<{
      season?: string;
      stat: T;
      team?: { id: number; name: string; abbreviation?: string };
    }>;
  }>;
};

export type MlbAward = {
  id: string;
  name: string;
  season: string;
};

export type MlbAwardsResponse = {
  awards?: MlbAward[];
};

export type MlbPlayerListResponse = {
  people: Array<{
    id: number;
    fullName: string;
    nameSlug?: string;
    active?: boolean;
    primaryPosition?: { abbreviation?: string };
    mlbDebutDate?: string;
    lastPlayedDate?: string;
    currentTeam?: { id?: number; name?: string };
  }>;
};
