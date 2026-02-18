import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Constituency } from '../../domain/entities/constituency.entity';
import type { PartyResult } from '../../domain/entities/party-result.vo';
import { ConstituencyEntity } from './typeorm/constituency.entity';
import { PartyResultEntity } from './typeorm/party-result.entity';
import type { IConstituencyRepository } from './constituency.repository.interface';

function toDomain(
  c: ConstituencyEntity,
  results: PartyResultEntity[],
): Constituency {
  return {
    id: c.id,
    name: c.name,
    partyResults: results.map((r) => ({
      partyCode: r.partyCode,
      votes: r.votes,
    })),
  };
}

@Injectable()
export class ConstituencyRepository implements IConstituencyRepository {
  constructor(
    @InjectRepository(ConstituencyEntity)
    private readonly constituencyRepo: Repository<ConstituencyEntity>,
    @InjectRepository(PartyResultEntity)
    private readonly partyResultRepo: Repository<PartyResultEntity>,
  ) {}

  async findById(id: string): Promise<Constituency | null> {
    const entity = await this.constituencyRepo.findOne({
      where: { id },
      relations: ['partyResults'],
    });
    if (!entity) return null;
    return toDomain(entity, entity.partyResults);
  }

  async findByName(name: string): Promise<Constituency | null> {
    const entity = await this.constituencyRepo.findOne({
      where: { name },
      relations: ['partyResults'],
    });
    if (!entity) return null;
    return toDomain(entity, entity.partyResults);
  }

  async findAll(): Promise<Constituency[]> {
    const list = await this.constituencyRepo.find({
      relations: ['partyResults'],
      order: { name: 'ASC' },
    });
    return list.map((c) => toDomain(c, c.partyResults));
  }

  async upsertConstituencyWithPartyResults(
    name: string,
    partyResults: PartyResult[],
  ): Promise<Constituency> {
    let constituency = await this.constituencyRepo.findOne({
      where: { name },
      relations: ['partyResults'],
    });
    if (!constituency) {
      constituency = this.constituencyRepo.create({ name });
      constituency = await this.constituencyRepo.save(constituency);
    }

    for (const { partyCode, votes } of partyResults) {
      const existing = constituency.partyResults?.find(
        (r) => r.partyCode === partyCode,
      );
      if (existing) {
        existing.votes = votes;
        await this.partyResultRepo.save(existing);
      } else {
        const newResult = this.partyResultRepo.create({
          constituencyId: constituency.id,
          partyCode,
          votes,
        });
        await this.partyResultRepo.save(newResult);
        constituency.partyResults = constituency.partyResults ?? [];
        constituency.partyResults.push(newResult);
      }
    }

    const updated = await this.constituencyRepo.findOne({
      where: { id: constituency.id },
      relations: ['partyResults'],
    });
    return toDomain(updated!, updated!.partyResults);
  }
}
