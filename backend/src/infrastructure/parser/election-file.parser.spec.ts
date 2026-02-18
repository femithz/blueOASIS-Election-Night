import { parseElectionFile } from './election-file.parser';

describe('parseElectionFile', () => {
  it('parses a simple line (votes, code pairs)', () => {
    const input =
      'Basildon and Billericay,6898,C,11608,L,2008,LD,937,Ind,612,UKIP,1521,G';
    const { ok, errors } = parseElectionFile(input);
    expect(errors).toHaveLength(0);
    expect(ok).toHaveLength(1);
    expect(ok[0].constituencyName).toBe('Basildon and Billericay');
    expect(ok[0].partyResults).toEqual([
      { partyCode: 'C', votes: 6898 },
      { partyCode: 'L', votes: 11608 },
      { partyCode: 'LD', votes: 2008 },
      { partyCode: 'Ind', votes: 937 },
      { partyCode: 'UKIP', votes: 612 },
      { partyCode: 'G', votes: 1521 },
    ]);
  });

  it('handles escaped commas in constituency name', () => {
    const input =
      'Ealing\\, Southall,3883,C,8266,L,1986,LD,565,Ind,2819,UKIP,2411,G';
    const { ok, errors } = parseElectionFile(input);
    expect(errors).toHaveLength(0);
    expect(ok).toHaveLength(1);
    expect(ok[0].constituencyName).toBe('Ealing, Southall');
    expect(ok[0].partyResults[0]).toEqual({ partyCode: 'C', votes: 3883 });
  });

  it('handles multiple escaped commas in name', () => {
    const input =
      'Inverness\\, Nairn\\, Badenoch and Strathspey,2719,C,5187,L,4093,LD,778,Ind,465,UKIP,6,G,2297,SNP';
    const { ok, errors } = parseElectionFile(input);
    expect(errors).toHaveLength(0);
    expect(ok).toHaveLength(1);
    expect(ok[0].constituencyName).toBe(
      'Inverness, Nairn, Badenoch and Strathspey',
    );
    expect(
      ok[0].partyResults.some((r) => r.partyCode === 'SNP' && r.votes === 2297),
    ).toBe(true);
  });

  it('skips empty lines', () => {
    const input = 'Bedford,6643,C,5276,L\n\n\nBraintree,13146,C,2543,L';
    const { ok, errors } = parseElectionFile(input);
    expect(errors).toHaveLength(0);
    expect(ok).toHaveLength(2);
    expect(ok[0].constituencyName).toBe('Bedford');
    expect(ok[1].constituencyName).toBe('Braintree');
  });

  it('reports malformed lines without failing the whole file', () => {
    const input = 'Good,100,C,200,L\nBadLineNoNumbers\nAnother,50,C';
    const { ok, errors } = parseElectionFile(input);
    expect(ok).toHaveLength(2);
    expect(ok[0].constituencyName).toBe('Good');
    expect(ok[1].constituencyName).toBe('Another');
    expect(errors).toHaveLength(1);
    expect(errors[0].lineNumber).toBe(2);
    expect(errors[0].line).toBe('BadLineNoNumbers');
  });

  it('reports error when token count is odd (expected vote,code pairs)', () => {
    const input = 'Test,100,C,200,L,TrailingCode';
    const { ok, errors } = parseElectionFile(input);
    expect(ok).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].lineNumber).toBe(1);
    expect(errors[0].message).toMatch(/even number|pairs|token/i);
  });
});
