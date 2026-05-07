import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/players/getPlayer";
import { FlipCard } from "./FlipCard";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">{player.name}</span>
      </div>

      <FlipCard playerId={player.id} playerName={player.name} />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click the card to flip
      </p>

      <div className="flex gap-3 text-sm">
        <a
          href={`/api/card/${player.id}?side=front`}
          download={`${player.id}-front.png`}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download front
        </a>
        <a
          href={`/api/card/${player.id}?side=back`}
          download={`${player.id}-back.png`}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download back
        </a>
      </div>
    </main>
  );
}
