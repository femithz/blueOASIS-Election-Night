import { Controller, Get } from '@nestjs/common';
import { GetTotalsUseCase } from '../../application/get-totals/get-totals.use-case';

@Controller('api/totals')
export class TotalsController {
  constructor(private readonly getTotalsUseCase: GetTotalsUseCase) {}

  @Get()
  getTotals() {
    return this.getTotalsUseCase.execute();
  }
}
