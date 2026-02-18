export class ImportResultsResponseDto {
  imported!: number;
  errors!: Array<{ lineNumber: number; line: string; message: string }>;
}
