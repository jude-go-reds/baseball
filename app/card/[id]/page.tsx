import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/players/getPlayer";
import {
  STYLES,
  STYLE_LABELS,
  parseStyle,
} from "@/lib/cards/templates/registry";
import { FlipCard } from "./FlipCard";
import { FavoriteButton } from "./FavoriteButton";
import { AddToCollection } from "./AddToCollection";

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ style?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const style = parseStyle(sp.style);

  const player = await getPlayer(id);
  if (!player) notFound();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">{player.name}</span>
      </div>

      <FlipCard playerId={player.id} playerName={player.name} style={style} />

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {STYLES.map((s) => (
          <Link
            key={s}
            href={`/card/${player.id}?style=${s}`}
            scroll={false}
            className={`rounded-md border px-3 py-1.5 transition ${
              s === style
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            }`}
          >
            {STYLE_LABELS[s]}
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click the card to flip
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <FavoriteButton id={player.id} />
        <AddToCollection playerId={player.id} />
        <a
          href={`/api/card/${player.id}?style=${style}&side=front`}
          download={`${player.id}-${style}-front.png`}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download front
        </a>
        <a
          href={`/api/card/${player.id}?style=${style}&side=back`}
          download={`${player.id}-${style}-back.png`}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download back
        </a>
      </div>
    </main>
  );
}
