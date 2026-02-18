import type { PartyResult } from './party-result.vo';

export interface Constituency {
  id: string;
  name: string;
  partyResults: PartyResult[];
}
