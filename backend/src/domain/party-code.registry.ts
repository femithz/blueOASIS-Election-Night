import { PARTY_CODE_TO_NAME } from '../common/constants/party-codes';

export function getPartyName(code: string): string {
  return PARTY_CODE_TO_NAME[code] ?? code;
}
