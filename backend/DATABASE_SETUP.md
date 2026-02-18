# Database setup

The backend needs PostgreSQL running on your machine. Use the steps below.

---

## Install and run PostgreSQL

### macOS (Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

Create the database and user (if needed):

```bash
createuser -s postgres   # if you don't have a postgres user
createdb election        # database name
```

### Linux (apt)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb election
```

### Windows

Install [PostgreSQL for Windows](https://www.postgresql.org/download/windows/), then create a database named `election` (e.g. via pgAdmin or `psql`).

---

## Configure the backend

If your local Postgres uses the default user `postgres` and password `postgres`, no config is needed. Otherwise copy the example env and edit:

```bash
cd backend
cp .env.example .env
```

Set in `.env`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_DATABASE=election
```

---

## Run the backend

```bash
cd backend
npm install
npm run start:dev
```

The backend uses `synchronize: true` in development so the schema is created automatically on startup.

---

## Check that the database is running

```bash
psql -U postgres -d election -c "SELECT 1;"
```

If that succeeds, Postgres is running and the `election` database exists.

---

## Troubleshooting

| Error | What to do |
|-------|------------|
| `ECONNREFUSED 127.0.0.1:5432` | Postgres is not running. Start it (e.g. `brew services start postgresql@15` on macOS) and ensure port 5432 is not used by another service. |
| `database "election" does not exist` | Run `createdb election` (or create the database via your OS method). |
| Authentication failed | Set `DB_USERNAME` and `DB_PASSWORD` in `backend/.env` to match your Postgres user. |
