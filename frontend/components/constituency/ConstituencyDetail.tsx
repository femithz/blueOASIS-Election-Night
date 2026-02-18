"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stack } from "@/components/ui/Stack";
import { VoteBar } from "./VoteBar";
import { getPartyColor } from "@/lib/party-colors";
import type { Constituency } from "@/types/election";

export interface ConstituencyDetailProps {
  constituency: Constituency;
}

export function ConstituencyDetail({ constituency }: ConstituencyDetailProps) {
  const { name, winningParty, parties } = constituency;
  const totalVotes = parties.reduce((s, p) => s + p.votes, 0);
  const maxShare = Math.max(...parties.map((p) => p.sharePercent), 1);

  return (
    <Stack gap="lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h2>
        {winningParty && (
          <Badge
            colorClass={`${getPartyColor(winningParty.code)} text-white`}
            className="inline-flex w-fit flex-col items-start gap-0 self-start py-1.5"
          >
            <span className="block leading-tight">{winningParty.name}</span>
          </Badge>
        )}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Total votes: {totalVotes.toLocaleString()}
      </p>
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Vote share by party
        </h3>
        <Stack gap="md">
          {parties
            .slice()
            .sort((a, b) => b.votes - a.votes)
            .map((p) => (
              <VoteBar
                key={p.partyCode}
                partyCode={p.partyCode}
                partyName={p.partyName}
                votes={p.votes}
                sharePercent={p.sharePercent}
                maxPercent={maxShare}
                showVotes
              />
            ))}
        </Stack>
      </Card>
    </Stack>
  );
}
