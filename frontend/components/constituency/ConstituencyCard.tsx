"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPartyColor } from "@/lib/party-colors";
import type { Constituency } from "@/types/election";

export interface ConstituencyCardProps {
  constituency: Constituency;
  href?: string;
}

export function ConstituencyCard({
  constituency,
  href,
}: ConstituencyCardProps) {
  const { name, winningParty, parties } = constituency;
  const totalVotes = parties.reduce((s, p) => s + p.votes, 0);
  const content = (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        {winningParty && (
          <Badge
            colorClass={`${getPartyColor(winningParty.code)} text-white`}
            className="inline-flex w-fit flex-col items-start gap-0 self-start py-1.5"
          >
            <span className="block leading-tight">{winningParty.name}</span>
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {totalVotes.toLocaleString()} total votes · {parties.length} parties
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full w-full transition hover:opacity-90"
      >
        <Card className="flex h-full min-h-[7rem] flex-col p-4 transition hover:border-(--accent)/40">
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className="flex min-h-[7rem] flex-col p-4">{content}</Card>;
}
