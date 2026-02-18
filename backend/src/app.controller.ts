import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root(): { name: string; api: string } {
    return {
      name: 'Election Night API',
      api: '/api/import, /api/constituencies, /api/totals',
    };
  }
}
