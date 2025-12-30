# Quick Setup Guide

## 1. Create Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d postgres
```

**Option B: Using existing PostgreSQL**

```bash
# Login as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE node_framework;

# Exit
\q
```

**Option C: Using psql command**

```bash
sudo -u postgres createdb node_framework
```

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Configure Environment

```bash
# Copy .env.example to .env (already done)
# Edit .env if needed for your database credentials
```

## 4. Run Migrations

```bash
pnpm migrate
```

## 5. Run Seeders

```bash
pnpm seed
```

## 6. Start Development Server

```bash
pnpm dev
```

Server will run at: `http://localhost:3000`

## Test the API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Login with seeded user
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "Password123!"
  }'
```

## Troubleshooting

### Database Connection Error

If you get "database does not exist" error, create the database first:

```bash
sudo -u postgres createdb node_framework
```

### Permission Error

If you get permission error with PostgreSQL:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Change peer to md5 for local connections
# Then restart PostgreSQL
sudo systemctl restart postgresql
```
