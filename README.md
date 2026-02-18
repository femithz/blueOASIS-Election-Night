# Election Night – Blue Oasis

Full-stack application for ingesting election result files and presenting results via APIs and UI.

## Quick Start (Docker Compose)

**Prerequisites:** Docker and Docker Compose installed.

Run the entire system with a single command:

```bash
docker compose up
```

This starts:
- **PostgreSQL** database (port 5432)
- **Backend API** (http://localhost:3001)
- **Frontend UI** (http://localhost:3000)

Wait for all services to be healthy, then open http://localhost:3000 in your browser.

To stop all services:
```bash
docker compose down
```

To rebuild after code changes:
```bash
docker compose up --build
```

## Upload Result Files

Once the system is running, upload result files via:

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/import -F "file=@backend/data/sample-results.csv"
```

**Using the UI:**
1. Open http://localhost:3000
2. Click "Upload result file" button
3. Select a `.txt` or `.csv` file (one constituency per line)

## Manual Setup (Alternative)

If you prefer to run without Docker:

1. **Database:** Install and start PostgreSQL, create database `election`. See **backend/DATABASE_SETUP.md** for details.

2. **Backend** (from project root):
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   API: http://localhost:3001

3. **Frontend** (from project root, in another terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   UI: http://localhost:3000

## API Documentation

See **backend/README.md** for:
- Full API endpoints
- Request/response formats
- Assumptions and design decisions

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** NestJS (Node.js), TypeORM
- **Database:** PostgreSQL

## Design Decisions

- **Update semantics:** When importing a file, only parties present in that file for a constituency are updated; parties not mentioned remain unchanged.
- **Malformed lines:** Skipped and reported in errors; they do not affect stored data.
- **File format:** One line per constituency; comma-separated; constituency name first (commas inside names escaped as `\,`); then alternating votes, party code pairs.
- **Real-time updates:** UI polls for updates every 60 seconds to reflect changes from external uploads.
