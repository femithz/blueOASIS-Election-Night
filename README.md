# Election Night – Blue Oasis

Full-stack application for ingesting election result files and presenting results via APIs and UI.

---

## Steps to run on a new device (Docker)

Follow these steps exactly so the app builds and runs without errors.

### 1. Prerequisites

- **Docker Desktop** (or Docker Engine + Docker Compose) installed and running.
- The project folder (e.g. `blueoasis-election`) unpacked or cloned on the machine.

### 2. Open a terminal in the project root

- Open a terminal and go into the project folder.
- You must be in the **project root**: the folder that contains `docker-compose.yml`, and the `backend/` and `frontend/` folders.

Check you’re in the right place:

```bash
# You should see docker-compose.yml, backend, frontend
ls
# (or on Windows: dir)
```

**Important:** Do **not** run Docker commands from inside `frontend/` or `backend/`. Always run from the root folder that contains `docker-compose.yml`.

### 3. Build and start everything

From the project root, run:

```bash
docker compose up --build
```

- First time (or after code changes), `--build` rebuilds the images. This can take a few minutes.
- Wait until you see the backend and frontend logs without errors (e.g. “Ready” or “Listening on port 3000”).

### 4. Open the app

- In your browser go to: **http://localhost:3000**
- Backend API: **http://localhost:3001**

### 5. Stop the app

In the same terminal, press `Ctrl+C`, then:

```bash
docker compose down
```

---

## Quick reference (same as above, short)

| Step | Command / action |
|------|-------------------|
| 1 | Install Docker Desktop and start it. |
| 2 | Open terminal in **project root** (folder with `docker-compose.yml`, `backend/`, `frontend/`). |
| 3 | Run: `docker compose up --build` |
| 4 | Open http://localhost:3000 in the browser. |
| 5 | To stop: `Ctrl+C` then `docker compose down` |

**If something fails:** Make sure you are **not** inside `frontend/` or `backend/` when running `docker compose`. Run from the root folder only.

---

## Rebuild after code changes

From the project root:

```bash
docker compose up --build
```

Or to rebuild only one service (e.g. frontend):

```bash
docker compose up --build frontend
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
