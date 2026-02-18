/**
 * Types mirroring backend API responses. Single source of truth for frontend.
 */

export interface ConstituencyParty {
  partyCode: string;
  partyName: string;
  votes: number;
  sharePercent: number;
}

export interface WinningParty {
  code: string;
  name: string;
}

export interface Constituency {
  id: string;
  name: string;
  parties: ConstituencyParty[];
  winningParty: WinningParty | null;
}

export interface PartyTotals {
  partyCode: string;
  partyName: string;
  totalVotes: number;
  seats: number;
}

export interface Totals {
  totalVotesByParty: PartyTotals[];
  seatsByParty: Record<string, number>;
}
