#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/backup-db.sh [label]
#   label: optional, gets appended to the backup filename for context.
#          Useful before risky operations, e.g. `backup-db.sh pre_add_match_mvp`.
#          Only [a-zA-Z0-9_-] are allowed; everything else is stripped.

# ── Config ────────────────────────────────────────────────────────────────────
BACKUP_DIR="$HOME/.fulbito-backups"
MAX_BACKUPS=4
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

RAW_LABEL="${1:-}"
LABEL="$(printf '%s' "$RAW_LABEL" | tr -cd '[:alnum:]_-')"
LABEL_SUFFIX=""
[[ -n "$LABEL" ]] && LABEL_SUFFIX="_$LABEL"

BACKUP_FILE="$BACKUP_DIR/fulbito_${TIMESTAMP}${LABEL_SUFFIX}.sql.gz"

# Load DATABASE_URL from backend .env if not already set
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../apps/backend/.env"

if [[ -z "${DATABASE_URL:-}" && -f "$ENV_FILE" ]]; then
  export $(grep -E '^DATABASE_URL=' "$ENV_FILE" | xargs)
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌  DATABASE_URL is not set. Add it to apps/backend/.env or export it before running this script."
  exit 1
fi

# ── pg_dump lookup ────────────────────────────────────────────────────────────
PG_DUMP=""
for candidate in \
  "$(which pg_dump 2>/dev/null)" \
  "/opt/homebrew/bin/pg_dump" \
  "/usr/local/bin/pg_dump" \
  "/usr/bin/pg_dump" \
  "/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump"
do
  if [[ -x "$candidate" ]]; then
    PG_DUMP="$candidate"
    break
  fi
done

if [[ -z "$PG_DUMP" ]]; then
  echo "❌  pg_dump not found. Install it with:"
  echo "    brew install libpq && brew link --force libpq"
  exit 1
fi

# ── Backup ────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

echo "🗄️  Starting backup → $BACKUP_FILE"
"$PG_DUMP" "$DATABASE_URL" --no-owner --no-acl | gzip > "$BACKUP_FILE"
echo "✅  Backup complete ($(du -sh "$BACKUP_FILE" | cut -f1))"

# ── Rotate: keep only last MAX_BACKUPS ────────────────────────────────────────
# Portable replacement for `mapfile` (not available in macOS's default bash 3.2).
OLD_BACKUPS=()
while IFS= read -r line; do
  OLD_BACKUPS+=("$line")
done < <(ls -t "$BACKUP_DIR"/fulbito_*.sql.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)))

if [[ ${#OLD_BACKUPS[@]} -gt 0 ]]; then
  echo "🗑️  Removing ${#OLD_BACKUPS[@]} old backup(s):"
  for f in "${OLD_BACKUPS[@]}"; do
    echo "    - $(basename "$f")"
    rm -f "$f"
  done
fi

echo "📦  Backups kept: $(ls "$BACKUP_DIR"/fulbito_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')/$MAX_BACKUPS"
