import { Injectable } from '@nestjs/common';
import { getPartyName } from '../../domain/party-code.registry';
import { ConstituencyRepository } from '../../infrastructure/persistence/constituency.repository';

export interface PartyTotalsView {
  partyCode: string;
  partyName: string;
  totalVotes: number;
  seats: number;
}

export interface TotalsView {
  totalVotesByParty: PartyTotalsView[];
  seatsByParty: Record<string, number>;
}

@Injectable()
export class GetTotalsUseCase {
  constructor(private readonly constituencyRepo: ConstituencyRepository) {}

  async execute(): Promise<TotalsView> {
    const constituencies = await this.constituencyRepo.findAll();
    const totalVotesByParty: Record<string, number> = {};
    const seatsByParty: Record<string, number> = {};

    for (const c of constituencies) {
      for (const r of c.partyResults) {
        totalVotesByParty[r.partyCode] =
          (totalVotesByParty[r.partyCode] ?? 0) + r.votes;
      }
      if (c.partyResults.length > 0) {
        const winner = [...c.partyResults].sort((a, b) => {
          if (b.votes !== a.votes) return b.votes - a.votes;
          return a.partyCode.localeCompare(b.partyCode);
        })[0];
        seatsByParty[winner.partyCode] =
          (seatsByParty[winner.partyCode] ?? 0) + 1;
      }
    }

    const partyCodes = [
      ...new Set([
        ...Object.keys(totalVotesByParty),
        ...Object.keys(seatsByParty),
      ]),
    ].sort();
    const totalVotesByPartyList: PartyTotalsView[] = partyCodes.map((code) => ({
      partyCode: code,
      partyName: getPartyName(code),
      totalVotes: totalVotesByParty[code] ?? 0,
      seats: seatsByParty[code] ?? 0,
    }));

    return {
      totalVotesByParty: totalVotesByPartyList,
      seatsByParty,
    };
  }
}
