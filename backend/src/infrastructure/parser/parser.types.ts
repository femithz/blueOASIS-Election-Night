export interface ParsedPartyResult {
  partyCode: string;
  votes: number;
}

export interface ParsedRow {
  constituencyName: string;
  partyResults: ParsedPartyResult[];
}

export interface ParseError {
  lineNumber: number;
  line: string;
  message: string;
}

export interface ParseResult {
  ok: ParsedRow[];
  errors: ParseError[];
}
