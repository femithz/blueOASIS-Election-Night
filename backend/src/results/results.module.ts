import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstituencyEntity } from '../infrastructure/persistence/typeorm/constituency.entity';
import { PartyResultEntity } from '../infrastructure/persistence/typeorm/party-result.entity';
import { ConstituencyRepository } from '../infrastructure/persistence/constituency.repository';
import { ImportResultsUseCase } from '../application/import-results/import-results.use-case';
import { GetConstituencyUseCase } from '../application/get-constituency/get-constituency.use-case';
import { GetTotalsUseCase } from '../application/get-totals/get-totals.use-case';
import { ImportController } from '../api/import/import.controller';
import { ConstituenciesController } from '../api/constituencies/constituencies.controller';
import { TotalsController } from '../api/totals/totals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConstituencyEntity, PartyResultEntity])],
  controllers: [ImportController, ConstituenciesController, TotalsController],
  providers: [
    ConstituencyRepository,
    ImportResultsUseCase,
    GetConstituencyUseCase,
    GetTotalsUseCase,
  ],
  exports: [GetConstituencyUseCase, GetTotalsUseCase, ConstituencyRepository],
})
export class ResultsModule {}
