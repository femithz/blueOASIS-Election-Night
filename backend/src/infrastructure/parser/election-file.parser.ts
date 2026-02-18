import type { ParseError, ParseResult, ParsedRow } from './parser.types';

function splitByUnescapedCommas(s: string): string[] {
  const tokens: string[] = [];
  let current = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === ',') {
      current += ',';
      i++;
    } else if (c === ',') {
      tokens.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  if (current.length > 0) tokens.push(current.trim());
  return tokens;
}

function extractNameAndRest(line: string): { name: string; rest: string } {
  let name = '';
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === '\\' && line[i + 1] === ',') {
      name += ',';
      i += 2;
    } else if (c === ',') {
      i++;
      break;
    } else {
      name += c;
      i++;
    }
  }
  const rest = line.slice(i);
  return { name: name.trim(), rest: rest.trim() };
}

function parsePartyPairs(rest: string): { partyCode: string; votes: number }[] {
  if (!rest) return [];
  const tokens = splitByUnescapedCommas(rest);
  if (tokens.length % 2 !== 0) {
    throw new Error(
      'Expected even number of vote,party-code pairs (got ' +
        tokens.length +
        ' token(s))',
    );
  }
  const results: { partyCode: string; votes: number }[] = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const first = tokens[i];
    const second = tokens[i + 1];
    const votes = parseInt(first, 10);
    if (Number.isNaN(votes) || votes < 0) {
      throw new Error(`Invalid votes: ${first}`);
    }
    if (!second) {
      throw new Error('Empty party code');
    }
    results.push({ partyCode: second, votes });
  }
  return results;
}

function parseLine(line: string): ParsedRow {
  const { name, rest } = extractNameAndRest(line);
  if (!name) {
    throw new Error('Empty constituency name');
  }
  const partyResults = parsePartyPairs(rest);
  if (partyResults.length === 0) {
    throw new Error('At least one party result required');
  }
  return { constituencyName: name, partyResults };
}

export function parseElectionFile(content: string | Buffer): ParseResult {
  const text =
    typeof content === 'string' ? content : content.toString('utf-8');
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const ok: ParsedRow[] = [];
  const errors: ParseError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    try {
      const row = parseLine(line);
      ok.push(row);
    } catch (err) {
      errors.push({
        lineNumber,
        line,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { ok, errors };
}
