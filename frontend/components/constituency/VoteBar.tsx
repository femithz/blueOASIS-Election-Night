"use client";

import { getPartyColor } from "@/lib/party-colors";

export interface VoteBarProps {
  partyCode: string;
  partyName: string;
  votes: number;
  sharePercent: number;
  maxPercent?: number;
  showVotes?: boolean;
}

export function VoteBar({
  partyCode,
  partyName,
  votes,
  sharePercent,
  maxPercent = 100,
  showVotes = true,
}: VoteBarProps) {
  const colorClass = getPartyColor(partyCode);
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 gap-y-1 text-sm">
      <div className="min-w-0">
        <span className="block font-medium text-zinc-800 dark:text-zinc-200">
          {partyCode}
        </span>
        <span className="block text-zinc-600 dark:text-zinc-300">
          {partyName}
        </span>
        {showVotes && (
          <span className="mt-0.5 block text-zinc-500 dark:text-zinc-400">
            {votes.toLocaleString()} votes
          </span>
        )}
      </div>
      <div className="w-24 flex-shrink-0 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
        {sharePercent.toFixed(1)}%
      </div>
      <div className="col-span-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${colorClass}`}
          style={{
            width: `${Math.min(100, (sharePercent / maxPercent) * 100)}%`,
          }}
          role="presentation"
        />
      </div>
    </div>
  );
}
