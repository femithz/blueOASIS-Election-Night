import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { parseElectionFile } from '../../infrastructure/parser/election-file.parser';
import { ConstituencyRepository } from '../../infrastructure/persistence/constituency.repository';

@Injectable()
export class ImportResultsUseCase {
  constructor(
    private readonly constituencyRepo: ConstituencyRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(fileContent: Buffer): Promise<{
    imported: number;
    errors: Array<{ lineNumber: number; line: string; message: string }>;
  }> {
    const { ok, errors } = parseElectionFile(fileContent);

    if (ok.length > 0) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        for (const row of ok) {
          await this.constituencyRepo.upsertConstituencyWithPartyResults(
            row.constituencyName,
            row.partyResults,
          );
        }
        await queryRunner.commitTransaction();
      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw e;
      } finally {
        await queryRunner.release();
      }
    }

    return {
      imported: ok.length,
      errors: errors.map((e) => ({
        lineNumber: e.lineNumber,
        line: e.line,
        message: e.message,
      })),
    };
  }
}
