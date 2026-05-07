import {
  getAwards,
  getCareerHitting,
  getCareerPitching,
  getPerson,
  getYearByYearHitting,
  getYearByYearPitching,
} from "@/lib/mlb/client";
import type { MlbAward, MlbStatsResponse } from "@/lib/mlb/types";
import type {
  HitterCareer,
  Honors,
  PitcherCareer,
  Player,
} from "@/lib/cards/types";

const HOF_AWARDS = new Set(["MLBHOF"]);
const WS_AWARDS = new Set(["WSCHAMP"]);
const MVP_AWARDS = new Set(["ALMVP", "NLMVP", "ALAWARD", "NLAWARD"]);
const CY_AWARDS = new Set(["ALCY", "NLCY"]);
const AS_AWARDS = new Set(["ALAS", "NLAS"]);
const GG_AWARDS = new Set(["ALGG", "NLGG"]);
const SS_AWARDS = new Set(["ALSS", "NLSS"]);

function summarizeHonors(awards: MlbAward[] | undefined): Honors {
  const h: Honors = {
    worldSeries: 0,
    mvp: 0,
    allStar: 0,
    goldGlove: 0,
    silverSlugger: 0,
    cyYoung: 0,
    hofYear: null,
  };
  for (const a of awards ?? []) {
    if (HOF_AWARDS.has(a.id)) {
      const year = parseInt(a.season, 10);
      if (Number.isFinite(year)) h.hofYear = year;
    } else if (WS_AWARDS.has(a.id)) h.worldSeries++;
    else if (MVP_AWARDS.has(a.id)) h.mvp++;
    else if (CY_AWARDS.has(a.id)) h.cyYoung++;
    else if (AS_AWARDS.has(a.id)) h.allStar++;
    else if (GG_AWARDS.has(a.id)) h.goldGlove++;
    else if (SS_AWARDS.has(a.id)) h.silverSlugger++;
  }
  return h;
}

function firstSplit<T>(res: MlbStatsResponse<T>): T | null {
  return res.stats?.[0]?.splits?.[0]?.stat ?? null;
}

function buildHitting(stat: ReturnType<typeof firstSplit>): HitterCareer | null {
  if (!stat) return null;
  const s = stat as Record<string, unknown>;
  return {
    avg: String(s.avg ?? ".000"),
    obp: String(s.obp ?? ".000"),
    slg: String(s.slg ?? ".000"),
    ops: String(s.ops ?? ".000"),
    hr: Number(s.homeRuns ?? 0),
    rbi: Number(s.rbi ?? 0),
    h: Number(s.hits ?? 0),
    r: Number(s.runs ?? 0),
    sb: Number(s.stolenBases ?? 0),
  };
}

function buildPitching(stat: ReturnType<typeof firstSplit>): PitcherCareer | null {
  if (!stat) return null;
  const s = stat as Record<string, unknown>;
  const ip = s.inningsPitched;
  if (!ip || ip === "0.0") return null;
  return {
    w: Number(s.wins ?? 0),
    l: Number(s.losses ?? 0),
    era: String(s.era ?? "-.--"),
    whip: String(s.whip ?? "-.--"),
    k: Number(s.strikeOuts ?? 0),
    ip: String(ip),
    sv: Number(s.saves ?? 0),
  };
}

const TEAM_ABBR: Record<string, string> = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Boston Braves": "BSN",
  "Brooklyn Dodgers": "BRO",
  "Brooklyn Robins": "BRO",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Cleveland Indians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Florida Marlins": "FLA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "New York Giants": "NYG",
  "Oakland Athletics": "OAK",
  "Athletics": "ATH",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "Seattle Mariners": "SEA",
  "San Francisco Giants": "SF",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
};

function teamLabel(name: string | undefined): string {
  if (!name) return "";
  return TEAM_ABBR[name] ?? name;
}

function uniqueTeamsFromSplits(
  ...sources: Array<MlbStatsResponse<unknown> | null>
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const r of sources) {
    if (!r) continue;
    for (const split of r.stats?.[0]?.splits ?? []) {
      const name = split.team?.name;
      if (!name) continue;
      const label = teamLabel(name);
      if (!seen.has(label)) {
        seen.add(label);
        ordered.push(label);
      }
    }
  }
  return ordered;
}

function yearsLabel(
  debut: string | undefined,
  last: string | undefined,
  active: boolean,
): string {
  const start = debut ? debut.slice(0, 4) : "";
  const end = last ? last.slice(0, 4) : "";
  if (active && start) return `${start} - present`;
  if (start && end && start !== end) return `${start} - ${end}`;
  if (start) return start;
  return "";
}

function photoUrl(id: number): string {
  return `https://midfield.mlbstatic.com/v1/people/${id}/spots/240`;
}

export async function getPlayer(id: string): Promise<Player | null> {
  if (!/^\d+$/.test(id)) return null;

  let person, hitting, pitching, awards, ybyHitting, ybyPitching;
  try {
    [person, hitting, pitching, awards, ybyHitting, ybyPitching] = await Promise.all([
      getPerson(id),
      getCareerHitting(id),
      getCareerPitching(id),
      getAwards(id),
      getYearByYearHitting(id),
      getYearByYearPitching(id),
    ]);
  } catch {
    return null;
  }

  const p = person.people?.[0];
  if (!p) return null;

  const hittingCareer = buildHitting(firstSplit(hitting));
  const pitchingCareer = buildPitching(firstSplit(pitching));

  if (!hittingCareer && !pitchingCareer) return null;

  const teams = uniqueTeamsFromSplits(ybyHitting, ybyPitching).slice(0, 4);

  return {
    id: String(p.id),
    name: p.fullName,
    team: teams.join(" / "),
    position: p.primaryPosition?.abbreviation ?? "",
    years: yearsLabel(p.mlbDebutDate, p.lastPlayedDate, Boolean(p.active)),
    photoUrl: photoUrl(p.id),
    honors: summarizeHonors(awards.awards),
    hitting: hittingCareer,
    pitching: pitchingCareer,
  };
}
