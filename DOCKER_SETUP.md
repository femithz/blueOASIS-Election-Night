# Docker Setup Guide

## Quick Start

```bash
docker compose up
```

This single command starts:
- PostgreSQL database
- Backend API (NestJS)
- Frontend UI (Next.js)

## Services

- **PostgreSQL**: Port 5432
- **Backend API**: http://localhost:3001
- **Frontend UI**: http://localhost:3002

## Environment Variables

All services use default values suitable for local development. To customize:

1. Create a `.env` file in the project root
2. Override any variables as needed

### Backend Variables
- `DB_HOST` (default: postgres)
- `DB_PORT` (default: 5432)
- `DB_USERNAME` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `DB_DATABASE` (default: election)
- `PORT` (default: 3001)

### Frontend Variables
- `NEXT_PUBLIC_API_URL` (default: http://localhost:3001)

## Rebuilding

After code changes:
```bash
docker compose up --build
```

## Stopping

```bash
docker compose down
```

To also remove volumes (database data):
```bash
docker compose down -v
```

## Troubleshooting

- **Port conflicts**: If ports 3001, 3002, or 5432 are in use, modify `docker-compose.yml`
- **Database connection**: Backend waits for PostgreSQL health check before starting
- **Build failures**: Ensure Docker has sufficient memory (recommended: 4GB+)
