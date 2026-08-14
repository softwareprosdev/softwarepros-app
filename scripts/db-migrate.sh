#!/bin/sh
# Applies pending Prisma migrations, then exits.
#
# This exists because a deploy that ships new schema without running
# `prisma migrate deploy` leaves the app talking to a database that has no
# tables for it — which surfaces to visitors as "The AI Architect is offline"
# with `ref: db_not_migrated`. Nobody should have to remember a manual step to
# avoid that, so the deploy runs this for them.
#
# Used two ways:
#   - as the `migrate` service in coolify-compose.yaml, which the app service
#     waits on (`service_completed_successfully`) before it starts;
#   - as a Coolify pre-deployment command on a Nixpacks build.
#
# `migrate deploy` is idempotent and takes an advisory lock, so running it on
# every boot — and on every replica — is safe.

set -eu

# The database is usually starting up alongside this container, so a refused
# connection is expected for the first few seconds and is not a failure yet.
attempts="${MIGRATE_MAX_ATTEMPTS:-12}"
delay="${MIGRATE_RETRY_SECONDS:-5}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "db-migrate: DATABASE_URL is not set." >&2
  echo "db-migrate: set it in the Coolify environment variables for this resource." >&2
  exit 1
fi

# Never echo DATABASE_URL — it carries the password, and deploy logs are not
# a secret store. The host is enough to tell "wrong database" from "no database".
echo "db-migrate: applying migrations (up to ${attempts} attempts, ${delay}s apart)"

n=1
while :; do
  if npx --no-install prisma migrate deploy; then
    echo "db-migrate: database schema is up to date."
    exit 0
  fi

  if [ "$n" -ge "$attempts" ]; then
    echo "db-migrate: FAILED after ${n} attempts. Current state:" >&2
    npx --no-install prisma migrate status || true
    echo "db-migrate: the app was not started. Fix the database, then redeploy." >&2
    exit 1
  fi

  echo "db-migrate: attempt ${n} failed; retrying in ${delay}s" >&2
  n=$((n + 1))
  sleep "$delay"
done
