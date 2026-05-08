// Team abbreviation -> MLB Stats API team ID. The MLB static CDN serves
// official SVG logos at https://www.mlbstatic.com/team-logos/<id>.svg with
// no auth and aggressive caching. Only current 30 franchises are mapped;
// historical / Negro League / 19th-c. teams have no logo and fall back to
// the abbreviation text in the UI.
const TEAM_ID: Record<string, number> = {
  ARI: 109,
  AZ: 109,
  ATL: 144,
  BAL: 110,
  BOS: 111,
  CHC: 112,
  CIN: 113,
  CLE: 114,
  COL: 115,
  DET: 116,
  HOU: 117,
  KC: 118,
  LAA: 108,
  LAD: 119,
  MIA: 146,
  MIL: 158,
  MIN: 142,
  NYM: 121,
  NYY: 147,
  ATH: 133,
  OAK: 133,
  PHI: 143,
  PIT: 134,
  SD: 135,
  SEA: 136,
  SF: 137,
  STL: 138,
  TB: 139,
  TEX: 140,
  TOR: 141,
  WSH: 120,
  CWS: 145,
  CHW: 145,
};

export function teamLogoUrl(abbr: string): string | null {
  const id = TEAM_ID[abbr.toUpperCase()];
  return id ? `https://www.mlbstatic.com/team-logos/${id}.svg` : null;
}
