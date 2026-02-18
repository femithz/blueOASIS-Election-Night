import type { Constituency } from '../../domain/entities/constituency.entity';
import type { PartyResult } from '../../domain/entities/party-result.vo';

export interface IConstituencyRepository {
  findById(id: string): Promise<Constituency | null>;
  findByName(name: string): Promise<Constituency | null>;
  findAll(): Promise<Constituency[]>;
  upsertConstituencyWithPartyResults(
    name: string,
    partyResults: PartyResult[],
  ): Promise<Constituency>;
}
