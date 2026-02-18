import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportResultsUseCase } from '../../application/import-results/import-results.use-case';
import { ImportResultsResponseDto } from '../../application/import-results/import-results.dto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('api')
export class ImportController {
  constructor(private readonly importResultsUseCase: ImportResultsUseCase) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType:
              /^(text\/plain|text\/csv|application\/octet-stream)(;.*)?$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: {
      buffer: Buffer;
    },
  ): Promise<ImportResultsResponseDto> {
    if (!file.buffer?.length) {
      throw new BadRequestException('File is empty');
    }
    const result = await this.importResultsUseCase.execute(file.buffer);
    return result;
  }
}
