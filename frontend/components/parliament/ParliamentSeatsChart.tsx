"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PartySeatRow } from "./PartySeatRow";
import { useTotals } from "@/hooks/use-totals";
import { ELECTION_RESULTS_UPDATED } from "@/components/upload/FileUpload";

export function ParliamentSeatsChart() {
  const { state, fetchTotals } = useTotals();

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  useEffect(() => {
    const refetch = () => fetchTotals();
    window.addEventListener(ELECTION_RESULTS_UPDATED, refetch);
    return () => window.removeEventListener(ELECTION_RESULTS_UPDATED, refetch);
  }, [fetchTotals]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <Card className="p-4">
        <Skeleton className="mb-4 h-5 w-48" />
        <Stack gap="md">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </Stack>
      </Card>
    );
  }

  if (state.status === "error") {
    return <ErrorMessage message={state.error.message} onRetry={fetchTotals} />;
  }

  const { totalVotesByParty, seatsByParty } = state.data;
  const totalSeats = Object.values(seatsByParty).reduce((a, b) => a + b, 0);

  if (totalVotesByParty.length === 0) {
    return (
      <Card className="p-6 text-center text-zinc-500 dark:text-zinc-400">
        No results yet. Upload a result file to see the parliament distribution.
      </Card>
    );
  }

  const sorted = [...totalVotesByParty].sort((a, b) => b.seats - a.seats);

  return (
    <Card className="p-4">
      <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Seats by party
      </h3>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {totalSeats} total seats
      </p>
      <Stack gap="sm">
        {sorted.map((party) => (
          <PartySeatRow
            key={party.partyCode}
            party={party}
            totalSeats={totalSeats}
            showVotes
          />
        ))}
      </Stack>
    </Card>
  );
}
