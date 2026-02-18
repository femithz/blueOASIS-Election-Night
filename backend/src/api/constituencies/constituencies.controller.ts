import { Controller, Get, Param } from '@nestjs/common';
import { GetConstituencyUseCase } from '../../application/get-constituency/get-constituency.use-case';

@Controller('api/constituencies')
export class ConstituenciesController {
  constructor(
    private readonly getConstituencyUseCase: GetConstituencyUseCase,
  ) {}

  @Get()
  list() {
    return this.getConstituencyUseCase.list();
  }

  @Get('by-name/:name')
  getByName(@Param('name') name: string) {
    return this.getConstituencyUseCase.getByName(decodeURIComponent(name));
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getConstituencyUseCase.getById(id);
  }
}
