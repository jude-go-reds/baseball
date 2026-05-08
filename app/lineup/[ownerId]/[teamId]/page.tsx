import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { readLineups } from "@/app/api/lineups/route";
import { LineupView } from "./LineupView";

export default async function LineupPage({
  params,
}: {
  params: Promise<{ ownerId: string; teamId: string }>;
}) {
  const { ownerId, teamId } = await params;

  let user;
  try {
    const client = await clerkClient();
    user = await client.users.getUser(ownerId);
  } catch {
    notFound();
  }
  const lineups = readLineups(user.publicMetadata as Record<string, unknown>);
  const lineup = lineups.find((l) => l.id === teamId);
  if (!lineup) notFound();

  const { userId } = await auth();
  const isOwner = userId === ownerId;
  const ownerName = user.username ?? user.firstName ?? "a fan";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-2 sm:p-6">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        {isOwner ? (
          <Link
            href="/lineups"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Lineups
          </Link>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Lineup</span>
        )}
        <span className="text-gray-400">/</span>
        <span className="font-medium">{lineup.name}</span>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold sm:text-3xl">{lineup.name}</h1>
        {!isOwner && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            by {ownerName}
          </p>
        )}
      </header>

      <LineupView
        ownerId={ownerId}
        initialLineup={lineup}
        isOwner={isOwner}
      />
    </main>
  );
}
