export const PARTY_CODE_TO_NAME: Record<string, string> = {
  C: 'Conservative Party',
  L: 'Labour Party',
  UKIP: 'UKIP',
  LD: 'Liberal Democrats',
  G: 'Green Party',
  Ind: 'Independent',
  SNP: 'SNP',
} as const;

export const KNOWN_PARTY_CODES = Object.keys(PARTY_CODE_TO_NAME);
