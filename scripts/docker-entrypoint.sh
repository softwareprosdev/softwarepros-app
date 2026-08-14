#!/bin/sh
# Applies migrations, then hands control to the app.
#
# This runs inside the one container that serves traffic, deliberately. The
# alternative — a separate one-shot `migrate` service that the app waits on —
# is tidier on paper and was worse in practice: Coolify assigns domains per
# compose service, so the bare domain kept landing on a container that exits
# by design, and Traefik answered "no available server" for a site whose app
# was running perfectly.
#
# `exec` matters: it replaces this shell with `next start` as PID 1, so Docker
# delivers SIGTERM to the server itself and shutdown stays clean.

set -eu

/app/scripts/db-migrate.sh

exec "$@"
