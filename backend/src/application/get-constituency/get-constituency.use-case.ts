import { Injectable, NotFoundException } from '@nestjs/common';
import { getPartyName } from '../../domain/party-code.registry';
import { ConstituencyRepository } from '../../infrastructure/persistence/constituency.repository';

export interface ConstituencyPartyView {
  partyCode: string;
  partyName: string;
  votes: number;
  sharePercent: number;
}

export interface ConstituencyView {
  id: string;
  name: string;
  parties: ConstituencyPartyView[];
  winningParty: { code: string; name: string } | null;
}

@Injectable()
export class GetConstituencyUseCase {
  constructor(private readonly constituencyRepo: ConstituencyRepository) {}

  async getById(id: string): Promise<ConstituencyView> {
    const c = await this.constituencyRepo.findById(id);
    if (!c) throw new NotFoundException(`Constituency not found: ${id}`);
    return this.toView(c);
  }

  async getByName(name: string): Promise<ConstituencyView> {
    const c = await this.constituencyRepo.findByName(name);
    if (!c) throw new NotFoundException(`Constituency not found: ${name}`);
    return this.toView(c);
  }

  async list(): Promise<ConstituencyView[]> {
    const list = await this.constituencyRepo.findAll();
    return list.map((c) => this.toView(c));
  }

  private toView(c: {
    id: string;
    name: string;
    partyResults: Array<{ partyCode: string; votes: number }>;
  }): ConstituencyView {
    const totalVotes = c.partyResults.reduce((s, r) => s + r.votes, 0);
    const parties: ConstituencyPartyView[] = c.partyResults.map((r) => ({
      partyCode: r.partyCode,
      partyName: getPartyName(r.partyCode),
      votes: r.votes,
      sharePercent:
        totalVotes > 0 ? Math.round((r.votes / totalVotes) * 1000) / 10 : 0,
    }));

    let winningParty: { code: string; name: string } | null = null;
    if (c.partyResults.length > 0) {
      const best = [...c.partyResults].sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        return a.partyCode.localeCompare(b.partyCode);
      })[0];
      winningParty = {
        code: best.partyCode,
        name: getPartyName(best.partyCode),
      };
    }

    return {
      id: c.id,
      name: c.name,
      parties,
      winningParty,
    };
  }
}
