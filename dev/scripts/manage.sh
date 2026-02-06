#!/bin/bash

# --- HELPER FUNCTIONS ---

function cleanup_processes() {
    echo "--- 🛑 Stopping processes & Cleaning Shared Memory ---"
    # 1. Kill processes (Targeting only your user)
    pkill -u $(whoami) -f "postgres|minio|bun"
    
    # 2. Nuke Shared Memory (The "Ghost Buster" fix)
    ipcs -m | grep $(whoami) | awk '{print $2}' | xargs -r -n 1 ipcrm -m
    
    # 3. Ensure folders exist
    mkdir -p data/postgres
    mkdir -p data/minio
}

function delete_data() {
    echo "--- 🧹 Wiping Data Folders ---"
    rm -rf data/postgres
    rm -rf data/minio
    mkdir -p data/postgres
    mkdir -p data/minio
}

function delete_containers() {
    echo "--- 🗑️ Deleting Containers ---"
    udocker rm wio-postgres-16
    udocker rm wio-minio
}

function start_system() {
    echo "--- 🚀 Booting System ---"

    # 1. Create Minio (Silent Create: Tries to create, ignores if already exists)
    # We use 2>/dev/null to hide the "already exists" error
    udocker create --name=wio-minio minio/minio:latest 2>/dev/null || true

    # 2. Create Postgres (Silent Create)
    udocker create --name=wio-postgres-16 postgres:16-alpine 2>/dev/null || true

    # 3. Start Minio
    echo "Starting Minio..."
    udocker run \
      -v $(pwd)/data/minio:/data \
      -p 19000:9000 \
      -p 19001:9001 \
      -e MINIO_ROOT_USER=minioadmin \
      -e MINIO_ROOT_PASSWORD=minioadmin \
      wio-minio server /data --console-address ":9001" >| minio.log 2>&1 &

    echo "Starting Postgres (Minimal Mode)..."
    udocker run \
      -v $(pwd)/data/postgres:/var/lib/postgresql/data \
      -p 5432:5432 \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_DB=wio \
      wio-postgres-16 postgres \
      -c max_connections=5 \
      -c shared_buffers=16MB \
      -c max_worker_processes=0 \
      -c max_parallel_workers=0 \
      -c max_parallel_maintenance_workers=0 \
      -c max_wal_senders=0 \
      -c autovacuum=off \
      -c track_counts=off \
      -c fsync=off \
      -c synchronous_commit=off \
      -c full_page_writes=off \
      -c dynamic_shared_memory_type=posix \
      -c listen_addresses='*' >| postgres.log 2>&1 &

    # 5. Wait for DB
    echo "Waiting for Database..."
    timeout=60
    while ! grep -q "database system is ready to accept connections" postgres.log; do
      sleep 2
      echo -n "."
      ((timeout--))
      if [ $timeout -le 0 ]; then
        echo "❌ Timed out. Check postgres.log"
        exit 1
      fi
    done
    echo ""
    echo "✅ Ready!"

    # 6. Seed Data (Safe to run multiple times)
    echo "Seeding Database..."
    udocker run \
      -v $(pwd):/app \
      -w /app \
      -e DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/wio" \
      wio-web bun -e 'import { sql } from "bun"; 
        await sql`CREATE TABLE IF NOT EXISTS site_assets (site_id TEXT NOT NULL, filename TEXT NOT NULL)`; 
        await sql`INSERT INTO site_assets (site_id, filename) VALUES ('\''test'\'', '\''demo'\'')`; 
        console.log("Seed check complete.");'

    # 7. Start App
    echo "Starting Web App..."
    udocker run \
      -p 3000:3000 \
      -v $(pwd):/app \
      -w /app \
      -e DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/wio" \
      -e S3_ENDPOINT="http://127.0.0.1:19000" \
      -e S3_ACCESS_KEY_ID=minioadmin \
      -e S3_SECRET_ACCESS_KEY=minioadmin \
      -e S3_BUCKET=wio-assets \
      -e S3_REGION=us-east-1 \
      wio-web /bin/sh -c "bun install && bun run dev --host"
}

# --- MAIN MENU ---

echo "=================================="
echo "   🤖 WIO SERVER MANAGER v1.1   "
echo "=================================="
echo "1) Start Server (Keep Data)"
echo "2) Full Restart (Wipe Data)"
echo "3) Nuclear Restart (Wipe Data + Containers)"
echo "=================================="
read -p "Select an option [1-3]: " choice

case $choice in
    1)
        cleanup_processes
        start_system
        ;;
    2)
        cleanup_processes
        delete_data
        start_system
        ;;
    3)
        cleanup_processes
        delete_data
        delete_containers
        start_system
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac
