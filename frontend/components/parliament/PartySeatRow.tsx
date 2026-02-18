"use client";

import { getPartyColor } from "@/lib/party-colors";
import type { PartyTotals } from "@/types/election";

export interface PartySeatRowProps {
  party: PartyTotals;
  totalSeats: number;
  showVotes?: boolean;
}

export function PartySeatRow({
  party,
  totalSeats,
  showVotes = true,
}: PartySeatRowProps) {
  const { partyCode, partyName, seats, totalVotes } = party;
  const pct = totalSeats > 0 ? (seats / totalSeats) * 100 : 0;
  const colorClass = getPartyColor(partyCode);

  return (
    <div className="grid grid-cols-[1fr_auto_auto_minmax(120px,1fr)] items-center gap-4 gap-y-2 text-sm">
      <div>
        <span className="block text-zinc-600 dark:text-zinc-300">
          {partyName}
        </span>
      </div>
      <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
        {seats} {seats === 1 ? "seat" : "seats"}
      </span>
      {showVotes && (
        <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
          {totalVotes.toLocaleString()} votes
        </span>
      )}
      <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${colorClass}`}
          style={{ width: `${Math.min(100, pct)}%` }}
          title={`${pct.toFixed(1)}% of seats`}
        />
      </div>
    </div>
  );
}
