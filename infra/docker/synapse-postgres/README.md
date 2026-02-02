# synapse-postgres

Local Synapse (Matrix homeserver) + Postgres for development.

## Quickstart

From repo root:

1. `cd infra/docker/synapse-postgres`
2. Generate initial config (creates `data/synapse/homeserver.yaml`, keys, etc):

   - PowerShell:
     - `mkdir -Force data\\synapse | Out-Null`
     - `docker run --rm -it -v ${PWD}\\data\\synapse:/data -e SYNAPSE_SERVER_NAME=localhost -e SYNAPSE_REPORT_STATS=no matrixdotorg/synapse:latest generate`
   - bash:
     - `mkdir -p data/synapse`
     - `docker run --rm -it -v "$PWD/data/synapse:/data" -e SYNAPSE_SERVER_NAME=localhost -e SYNAPSE_REPORT_STATS=no matrixdotorg/synapse:latest generate`

3. Edit `data/synapse/homeserver.yaml` and configure Postgres:

   Replace the `database:` section with:

   ```yaml
   database:
     name: psycopg2
     args:
       user: synapse
       password: synapse
       database: synapse
       host: postgres
       port: 5432
       cp_min: 5
       cp_max: 10
   ```

4. Start services:
   - `docker compose up -d`

5. Register a local user:
   - `docker compose exec synapse register_new_matrix_user -c /data/homeserver.yaml http://localhost:8008`

Synapse should be available at:
- `http://localhost:8008`

## Notes

- `data/` is ignored by git.
- For production-like setups, disable registration and use stronger secrets.
