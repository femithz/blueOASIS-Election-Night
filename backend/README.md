# Election Night Backend

NestJS backend for ingesting election result files, storing results, and exposing them via REST APIs.

## How to run

1. **Start PostgreSQL** on your machine (see **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for installation and setup).

2. **Start the backend** (from project root):

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

   API runs at http://localhost:3001. The backend connects to `localhost:5432` by default (user `postgres`, password `postgres`, database `election`).

If you see `ECONNREFUSED` on port 5432, the database is not running. See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for setup options.

## How to upload result files

**Endpoint:** `POST /api/import`

- **Content-Type:** `multipart/form-data`
- **Field name:** `file`
- **Body:** One file per request (raw text/CSV, one line per constituency)

Example with `curl`:

```bash
curl -X POST http://localhost:3001/api/import \
  -F "file=@backend/data/sample-results.csv"
```

Example response:

```json
{
  "imported": 89,
  "errors": []
}
```

If some lines are malformed, they are skipped and reported in `errors`; valid lines are still imported.

## APIs

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/import | Upload a result file (multipart, field `file`) |
| GET | /api/constituencies | List all constituencies with votes, share %, winning party |
| GET | /api/constituencies/:id | Get constituency by UUID |
| GET | /api/constituencies/by-name/:name | Get constituency by name (URL-encode name if it contains commas) |
| GET | /api/totals | National totals: total votes and seats per party |

## Assumptions and design decisions

- **Override semantics:** When a file is imported, only parties present in that file for a constituency are updated; parties not mentioned are left unchanged. New constituencies are added; existing ones are merged by party.
- **Malformed lines:** Skipped and returned in the `errors` array; they do not affect stored data. The import returns 200 with `imported` count and `errors` list.
- **Party codes:** Stored as in the file (e.g. C, L, LD, G, SNP). Display names come from the fixed mapping (Conservative Party, Labour Party, etc.); unknown codes are shown as the code.
- **Winning party:** The party with the most votes in the constituency. Ties are broken by party code (alphabetical order).
- **File format:** One line per constituency; comma-separated; constituency name first (commas inside the name are escaped as `\,`); then alternating **votes, party code** pairs. There must be an even number of tokens after the name (each pair is votes then code). See `data/DATA_FORMAT.md` and sample in `data/sample-results.csv`.

## Project structure

- `src/common` – constants (party codes), filters  
- `src/config` – database config  
- `src/domain` – domain entities and party registry  
- `src/infrastructure/parser` – election file parser (escaped commas, per-line errors)  
- `src/infrastructure/persistence` – TypeORM entities and constituency repository  
- `src/application` – use cases (import, get constituency, get totals)  
- `src/api` – controllers (import, constituencies, totals)  
- `src/results` – ResultsModule wiring everything together  

See `BACKEND_PLAN.md` for the full technical plan.
