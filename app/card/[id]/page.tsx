import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoPlayer } from "@/lib/cards/demoData";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = getDemoPlayer(id);

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

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/card/${player.id}`}
        alt={`${player.name} baseball card`}
        width={400}
        height={560}
        className="rounded-lg shadow-2xl"
      />

      <div className="flex gap-3 text-sm">
        <a
          href={`/api/card/${player.id}`}
          download={`${player.id}-card.png`}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download PNG
        </a>
      </div>
    </main>
  );
}
