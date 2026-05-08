import Link from "next/link";
import { notFound } from "next/navigation";
import { getByTeam } from "@/lib/players/searchIndex";
import { teamLogoUrl } from "@/lib/teams/logos";
import { FilteredPlayerList } from "../../FilteredPlayerList";
import { TeamFavoriteButton } from "./TeamFavoriteButton";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  const players = getByTeam(team);
  if (players.length === 0) notFound();

  const abbr = team.toUpperCase();
  const logo = teamLogoUrl(abbr);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/browse" className="text-blue-600 hover:underline dark:text-blue-400">
          Browse
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">{abbr}</span>
      </div>

      <header className="flex items-center gap-4">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={abbr}
            className="h-16 w-16 object-contain"
          />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{abbr}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {players.length} players associated with this team in the index.
          </p>
          <TeamFavoriteButton team={abbr} />
        </div>
      </header>

      <FilteredPlayerList entries={players} hideTeamFilter />
    </main>
  );
}
