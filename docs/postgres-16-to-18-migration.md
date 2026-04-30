# PostgreSQL 16 -> 18 Migration Runbook (Docker Compose)

This repository now supports a safe migration path from `postgres:16` to `postgres:18` with rollback.

## What was added

- `docker-compose.pg18.yml`
  - Overrides `db` to use `postgres:18`
  - Uses a separate volume `postgres18_data` mounted at `/var/lib/postgresql`
- `scripts/postgres/migrate-16-to-18.ps1`
  - End-to-end migration script with backup, restore, validation, and optional app restart
- `scripts/postgres/rollback-to-16.ps1`
  - Fast rollback back to Postgres 16 stack

## Important safety behavior

- The migration script creates **two backups** before switching:
  - Logical cluster dump (`pg_dumpall`)
  - Physical tar backup of the original Postgres 16 volume
- The original Postgres 16 volume is preserved.
- Postgres 18 uses a **new volume** (`postgres18_data`), so rollback is straightforward.

## Prerequisites

- Docker Engine and Docker Compose plugin available.
- Docker Compose plugin `2.24.4+` (required for `!override` in `docker-compose.pg18.yml`).
- Run commands from repo root:
  - `C:\Users\Warui Moche\OneDrive\Documents\EventHub`
- Ensure enough disk space for:
  - one SQL dump file
  - one compressed volume archive
  - one fresh Postgres 18 volume

## Migration (recommended sequence)

1. Optional: check current status
   - `docker compose ps`
2. Run migration script
   - `powershell -ExecutionPolicy Bypass -File .\scripts\postgres\migrate-16-to-18.ps1`
3. Verify app endpoints
   - Frontend: `http://localhost`
   - Backend: `http://localhost:8000`
4. Verify DB service is 18
   - `docker compose -f docker-compose.yml -f docker-compose.pg18.yml ps`

## Where backups are stored

- `ops/postgres/backups/eventhub-pg16-logical-<timestamp>.sql`
- `ops/postgres/backups/eventhub-pg16-volume-<timestamp>.tar.gz`

## Running stack on Postgres 18 after migration

Use both files whenever you manage the stack:

- Start:
  - `docker compose -f docker-compose.yml -f docker-compose.pg18.yml up -d`
- Stop:
  - `docker compose -f docker-compose.yml -f docker-compose.pg18.yml down`
- Status:
  - `docker compose -f docker-compose.yml -f docker-compose.pg18.yml ps`

## Rollback plan (if needed)

If validation fails or app behavior regresses:

1. Execute rollback script
   - `powershell -ExecutionPolicy Bypass -File .\scripts\postgres\rollback-to-16.ps1`
2. Confirm base stack health
   - `docker compose ps`

This returns the stack to Postgres 16 and the original data volume path in `docker-compose.yml`.

## Notes

- If you want to keep Postgres 18 as the long-term default, either:
  - keep using `-f docker-compose.yml -f docker-compose.pg18.yml`, or
  - merge the pg18 override into `docker-compose.yml` once you are confident in production behavior.
