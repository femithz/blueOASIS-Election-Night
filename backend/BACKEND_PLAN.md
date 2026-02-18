# Election Night Backend – Technical Plan & Step-by-Step Approach

This document breaks the backend into phases, defines architecture, and applies senior-level patterns so you can implement it systematically.

---

## 1. High-Level Architecture

### 1.1 Layered / Ports & Adapters (Hexagonal) Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HTTP Layer (Controllers)                                                │
│  - File upload, Constituency API, Total Results API                       │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  Application Layer (Use Cases / Application Services)                    │
│  - ImportResultsUseCase, GetConstituencyUseCase, GetTotalsUseCase        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  Domain Layer                                                            │
│  - Constituency, PartyResult, ElectionAggregate (entities/value objects) │
│  - Update rules, party code → name mapping                               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  Infrastructure (Port Implementations)                                   │
│  - Repository (PostgreSQL), File Parser, Party Code Registry             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why:** Clear boundaries, testable use cases with mocked repositories, and swappable infrastructure (e.g. different DB or parser).

### 1.2 Senior-Level Patterns to Apply

| Pattern | Where | Purpose |
|--------|--------|--------|
| **Repository** | Data access | Abstract persistence; one place for “get/upsert constituency”. |
| **Use case / application service** | One use case per operation | Import file, get constituency, get totals; no business logic in controllers. |
| **Domain entities & value objects** | Domain layer | Constituency (entity), PartyResult (value object), immutable where possible. |
| **Fail-safe parsing** | Parser | Per-line try/catch; bad lines → log + skip; never corrupt stored data. |
| **Transaction boundary** | Import use case | One transaction per file import; all-or-nothing per file (or explicit “per batch” if you split). |
| **Idempotent / override semantics** | Import | “Constituency exists → override only provided parties; leave others unchanged.” |
| **DTOs / API contracts** | Controllers | Request/response DTOs; validation (e.g. class-validator); consistent API shape. |
| **Constants / config** | Party codes, env | Party code → name in one place (constant or small “registry”); no magic strings. |

---

## 2. Phased Breakdown

### Phase 1: Foundation (DB, domain, config)

**Goal:** Database schema, domain model, and party code mapping in place.

#### Step 1.1 – Database schema (PostgreSQL)

- **Constituencies table:** `id` (UUID or serial), `name` (unique), `created_at`, `updated_at`.
- **Party results table:** `id`, `constituency_id` (FK), `party_code` (e.g. `C`, `L`), `votes` (integer), `updated_at`.  
  - Unique constraint on `(constituency_id, party_code)` so one row per party per constituency.
- **Indexes:** `constituency_id`, `party_code` (for aggregates), unique on `(constituency_id, party_code)`.

**Design note:** Store party **code** in DB; resolve to **name** in API/UI using the appendix mapping. This keeps DB normalized and allows future party list changes without migrations.

#### Step 1.2 – Domain layer (no framework dependencies)

- **Entities / value objects:**
  - `Constituency`: id, name, list of `PartyResult`.
  - `PartyResult`: partyCode, votes (value object, no id).
- **Party code registry (domain or small infra):**
  - Map: `C → Conservative Party`, `L → Labour Party`, etc. (from appendix).
  - Single source of truth; used when building API responses.

#### Step 1.3 – NestJS + TypeORM/Prisma

- Add **TypeORM** or **Prisma**; connect to PostgreSQL (config from env).
- Entities: `ConstituencyEntity`, `PartyResultEntity` (or Prisma schema) matching the schema above.
- Keep **domain** entities separate from **persistence** entities; map in repository layer.

**Deliverable:** DB runs (local PostgreSQL), migrations applied, domain types and party registry defined; no HTTP yet.

---

### Phase 2: File parsing & update rules

**Goal:** Reliably parse the supplier file format and implement the specified update/override behaviour.

#### Step 2.1 – Parser (infrastructure)

- **Input:** Raw file content (string or buffer).
- **Output:** List of parsed rows; each row = `{ constituencyName: string, partyResults: { partyCode: string, votes: number }[] }`.
- **Rules:**
  - One line per constituency.
  - Fields separated by commas, **except** commas escaped as `\,` are part of the constituency name.
  - First field = constituency name (after unescaping); remaining pairs = party code + votes (order: code, votes, code, votes, …).
  - Variable number of parties per row → no fixed column count; parse until end of line.
- **Robustness (senior-level):**
  - Parse **line by line**; wrap each line in try/catch.
  - On parse error: log line (and error), append to “rejected lines” or errors array, **continue**.
  - Return: `{ ok: ParsedRow[], errors: { lineNumber, line, message }[] }` so the use case can record failures without failing the whole file.
- **Validation:** Votes non-negative integer; party code non-empty; constituency name non-empty after trim/unescape.

**Deliverable:** Parser module with unit tests (including escaped commas, variable columns, and malformed lines).

#### Step 2.2 – Update rules (in application/domain)

- **If constituency does not exist:** Insert constituency + all party results from the row.
- **If constituency exists:**
  - For each (partyCode, votes) in the row: **upsert** (update if exists, insert if not).
  - **Do not** remove parties that are not in the new file; only override or add.
- Implement this in an **application service** (e.g. `ImportResultsUseCase`) that uses the parser and the repository.

**Deliverable:** Import use case that, given parsed rows, applies the above rules inside a transaction (one transaction per file).

---

### Phase 3: Repository & import API

**Goal:** Persist data via a repository and expose file upload API.

#### Step 3.1 – Repository interface and implementation

- **Interface (port):**
  - `findByName(name: string): Promise<Constituency | null>`
  - `upsertConstituencyWithPartyResults(constituency: Constituency, partyResults: PartyResult[]): Promise<void>`  
    Implement “override only these parties; leave others unchanged” (e.g. delete only the party rows present in the payload, then insert/update so that the new payload is the source of truth for those parties; or merge in SQL).
- Implementation uses TypeORM/Prisma and runs inside a transaction when called from the use case.

#### Step 3.2 – File upload endpoint

- **POST** `/api/import` or `/api/results/import` (multipart/form-data or raw body).
- Controller: accept file, call `ImportResultsUseCase.execute(file.buffer)` (or stream if you prefer).
- Use case:
  1. Parse file → `{ ok, errors }`.
  2. Start transaction.
  3. For each `ok` row: apply update rules via repository.
  4. Commit.
  5. Return: e.g. `{ imported: number, errors: Array<{ line, message }> }` (no 500 for parse errors; return 200 with partial success + error list).
- **Validation:** Max file size, allowed content type (e.g. text/plain, text/csv) to avoid abuse.

**Deliverable:** Upload endpoint that correctly adds new constituencies and updates existing ones (override only provided parties); malformed lines don’t corrupt stored data.

---

### Phase 4: Constituency API & Total Results API

**Goal:** REST APIs that match the spec and use the same domain/party registry.

#### Step 4.1 – Constituency API

- **GET** `/api/constituencies` – list all constituencies (optional: pagination, search by name).
- **GET** `/api/constituencies/:id` or `/api/constituencies/by-name/:name` – single constituency.
- **Response (per constituency):**
  - `name`
  - `parties`: array of `{ partyCode, partyName, votes, sharePercent }`
  - `winningParty`: party code (and optionally name) of party with max votes in that constituency
- **Computation:** Total votes = sum of votes in constituency; `sharePercent = (votes / totalVotes) * 100`. Resolve party names via party code registry.

#### Step 4.2 – Total Results API

- **GET** `/api/totals` or `/api/results/totals`
- **Response:**
  - `totalVotesByParty`: `{ [partyCode]: number }` (or array of `{ partyCode, partyName, totalVotes }`)
  - `seatsByParty`: `{ [partyCode]: number }` – count of constituencies where that party is winning (one MP per constituency)
- **Computation:** Aggregate from all constituencies; “winning” = party with max votes in that constituency.

**Deliverable:** Both APIs returning correct numbers and party names; use DTOs and keep controllers thin (delegate to use cases/services).

---

### Phase 5: Error handling, validation, and polish

**Goal:** Consistent errors, validation, and safe behaviour.

- **Global exception filter:** Map domain/application errors to HTTP status (e.g. 400, 404, 500) and a consistent JSON body.
- **Validation:** Use `class-validator` + `ValidationPipe` on DTOs for any request body/query params.
- **File import:** Never throw uncaught from parser; always return structure with successes + errors; 200 with body indicating partial failure when applicable.
- **Idempotency (optional):** If you want “same file uploaded twice = same state”, you can use content hash or “batch id” and skip duplicate ingest; not required by spec but good to note.

---

## 3. Suggested Folder Structure (NestJS)

```
backend/src/
├── main.ts
├── app.module.ts
├── common/                    # Shared utilities, filters, constants
│   ├── constants/
│   │   └── party-codes.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── pipes/
│       └── validation.pipe.ts
├── config/
│   └── database.config.ts
├── domain/
│   ├── entities/
│   │   ├── constituency.entity.ts
│   │   └── party-result.vo.ts
│   └── party-code.registry.ts
├── infrastructure/
│   ├── parser/
│   │   ├── election-file.parser.ts
│   │   └── parser.types.ts
│   └── persistence/
│       ├── constituency.repository.ts
│       ├── typeorm/           # or prisma/
│       │   └── ...
│       └── migrations/
├── application/
│   ├── import-results/
│   │   ├── import-results.use-case.ts
│   │   └── import-results.dto.ts
│   ├── get-constituency/
│   │   └── get-constituency.use-case.ts
│   └── get-totals/
│       └── get-totals.use-case.ts
├── api/
│   ├── import/
│   │   └── import.controller.ts
│   ├── constituencies/
│   │   └── constituencies.controller.ts
│   └── totals/
│       └── totals.controller.ts
└── app.module.ts
```

(Adjust to your preference: e.g. `modules/constituency`, `modules/import`, `modules/totals` with each containing its use case, controller, and repository.)

---

## 4. Implementation Order Checklist

- [ ] **Phase 1:** DB schema, migrations, domain types, party code registry, ORM setup.
- [ ] **Phase 2:** Parser with escaped-comma and variable-length support; unit tests; update rules in use case.
- [ ] **Phase 3:** Repository (find + upsert with override semantics); import use case with transaction; POST upload endpoint; partial success response.
- [ ] **Phase 4:** Constituency API (list + by id/name); Total Results API; DTOs and party name resolution.
- [ ] **Phase 5:** Global exception filter; validation pipes; documentation (README: how to run, how to upload, assumptions).

---

## 5. Assumptions & Design Decisions to Document in README

- **Override semantics:** Only parties present in the new file are updated; others for that constituency are left as-is.
- **Malformed lines:** Skipped and reported in the response; no partial write for that line; transaction still commits for valid lines.
- **Party codes:** Stored as in the file; display names from the fixed appendix mapping (C, L, UKIP, LD, G, Ind, SNP).
- **Winning party:** Tie-break (e.g. first by party code order) if votes are equal; state this in README.
- **File format:** One line per constituency; comma-separated; escaped commas only in constituency name; variable **(votes, code)** pairs after the name (votes first, then party code). Sample: `backend/data/sample-results.csv`.

---

## 6. Optional Enhancements (as per spec)

- **Real-time UI:** Add WebSocket or Server-Sent Events (e.g. on successful import) so the frontend can refresh or show a “New results” indicator.
- **Import progress/status:** For large files, consider chunked processing and a status endpoint or job id + polling.
- **Tests:** Unit tests for parser and use cases; e2e tests for upload and both APIs.
- **Edge cases:** Empty file; empty lines; duplicate constituency name in same file (last row wins); very long lines or huge files (limits + timeouts).

Using this plan, you can implement the backend in order: foundation → parsing → import API → read APIs → polish, while keeping clear boundaries and senior-level patterns throughout.

---

## Appendix A: Parser algorithm (escaped commas)

Constituency names can contain `\,` (comma escaped with backslash). Parse the first field as follows:

1. Scan character by character.
2. When you see `\`: if next char is `,`, emit a literal comma and skip both; otherwise emit `\` and continue.
3. When you see unescaped `,`: that ends the constituency name.
4. Remaining part of the line: split by unescaped commas (same rule: `\,` is literal comma). You get a flat list of tokens. In the **supplier format, each party is given as two tokens: votes then party code** (order: votes, code, votes, code, …). Pair them as (votes, code); validate votes are numeric and non-negative.

**Example line (from sample data):**  
`Basildon and Billericay,6898,C,11608,L,2008,LD,937,Ind,612,UKIP,1521,G`  
→ Name = `Basildon and Billericay`; parties = `[{ C, 6898 }, { L, 11608 }, { LD, 2008 }, { Ind, 937 }, { UKIP, 612 }, { G, 1521 }]` (last value `G` is party code with no following votes—see edge case below).

**Note:** The last token may be a party code with no votes value (e.g. trailing `,G`). Either treat the line as malformed or assign 0 votes to that party; document the choice.

---

## Appendix B: Steps at a glance

| # | Step | Outcome |
|---|------|--------|
| 1 | DB schema + migrations | `constituencies`, `party_results` tables |
| 2 | Domain types + party registry | `Constituency`, `PartyResult`, code → name map |
| 3 | ORM entities + repo interface | Persistence layer ready |
| 4 | Parser (with escaped-comma + errors) | `parse(file) → { ok, errors }` |
| 5 | Import use case + transaction | Apply update rules per row |
| 6 | Repository implementation | Upsert constituency + merge party results |
| 7 | POST /api/import | Upload file → parse → import → return summary |
| 8 | GET constituency API | List + single; votes, share %, winning party |
| 9 | GET totals API | Total votes by party, seats by party |
| 10 | Exception filter + validation | Consistent errors, DTO validation |
| 11 | Local run | backend + frontend + local PostgreSQL |
