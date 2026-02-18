import { DataSource } from 'typeorm';
import { ImportResultsUseCase } from './import-results.use-case';
import { ConstituencyRepository } from '../../infrastructure/persistence/constituency.repository';

describe('ImportResultsUseCase', () => {
  let useCase: ImportResultsUseCase;
  let mockRepo: jest.Mocked<
    Pick<ConstituencyRepository, 'upsertConstituencyWithPartyResults'>
  >;
  let mockQueryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };
  let mockDataSource: jest.Mocked<Pick<DataSource, 'createQueryRunner'>>;

  beforeEach(() => {
    mockRepo = {
      upsertConstituencyWithPartyResults: jest
        .fn()
        .mockResolvedValue(undefined),
    };
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };
    useCase = new ImportResultsUseCase(
      mockRepo as unknown as ConstituencyRepository,
      mockDataSource as unknown as DataSource,
    );
  });

  it('parses valid file and calls upsert for each row', async () => {
    const content = Buffer.from(
      'Bedford,6643,C,5276,L\nBraintree,13146,C,2543,L',
      'utf-8',
    );
    const result = await useCase.execute(content);

    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(mockRepo.upsertConstituencyWithPartyResults).toHaveBeenCalledTimes(
      2,
    );
    expect(mockRepo.upsertConstituencyWithPartyResults).toHaveBeenNthCalledWith(
      1,
      'Bedford',
      [
        { partyCode: 'C', votes: 6643 },
        { partyCode: 'L', votes: 5276 },
      ],
    );
    expect(mockRepo.upsertConstituencyWithPartyResults).toHaveBeenNthCalledWith(
      2,
      'Braintree',
      [
        { partyCode: 'C', votes: 13146 },
        { partyCode: 'L', votes: 2543 },
      ],
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('reports malformed lines and imports only valid rows', async () => {
    const content = Buffer.from(
      'Good,100,C,200,L\nBadOddTokens,10,A,20\nAnother,50,C',
      'utf-8',
    );
    const result = await useCase.execute(content);

    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].lineNumber).toBe(2);
    expect(result.errors[0].message).toMatch(/even number|pairs|token/i);
    expect(mockRepo.upsertConstituencyWithPartyResults).toHaveBeenCalledTimes(
      2,
    );
  });

  it('returns only errors when no line is valid', async () => {
    const content = Buffer.from('NoNumbersHere\nAlsoBad,1', 'utf-8');
    const result = await useCase.execute(content);

    expect(result.imported).toBe(0);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(mockRepo.upsertConstituencyWithPartyResults).not.toHaveBeenCalled();
  });
});
