# 🚀 Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL / MySQL / MongoDB (pilih salah satu)
- Redis (optional, untuk caching dan queue)

## Installation Steps

### 1. Install Dependencies
```bash
cd Node-framework
npm install
```

### 2. Configure Environment
```bash
# File .env sudah dibuat, edit sesuai kebutuhan
nano .env
```

**Minimal Configuration:**
```env
# Application
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Database (pilih salah satu)
DB_TYPE=postgres  # atau mysql, mongodb

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=node_framework
```

### 3. Setup Database

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up -d postgres redis
```

**Option B: Manual Setup**
- Install PostgreSQL/MySQL/MongoDB
- Create database: `node_framework`
- Update credentials di .env

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Setup Git Hooks
```bash
npm run prepare
```

### 6. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Access Protected Route
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 View API Documentation

Open browser: `http://localhost:3000/api-docs`

## 🐳 Docker Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm run build            # Build TypeScript
npm start                # Start production server

# Database
npm run migrate          # Run migrations
npm run migrate:rollback # Rollback last migration

# Code Quality
npm run lint             # Check code
npm run lint:fix         # Fix issues
npm run format           # Format code

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
```

## 📁 Project Structure

```
Node-framework/
├── src/
│   ├── config/              # Configuration
│   ├── domain/              # Business entities
│   ├── application/         # Use cases
│   ├── infrastructure/      # External services
│   ├── presentation/        # Controllers & routes
│   └── shared/              # Utilities
├── logs/                    # Application logs
├── .env                     # Environment variables
└── docker-compose.yml       # Docker configuration
```

## 🎯 Next Steps

1. **Customize Configuration**: Edit `.env` sesuai kebutuhan
2. **Add Your Entities**: Buat entities di `src/domain/`
3. **Create Use Cases**: Implementasi business logic di `src/application/`
4. **Add Controllers**: Tambah endpoints di `src/presentation/`
5. **Write Tests**: Buat tests untuk components
6. **Deploy**: Deploy ke production server

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

### Database Connection Error
- Check database is running
- Verify credentials in .env
- Check firewall settings

### Redis Connection Error
- Redis is optional
- Set `ENABLE_CACHE=false` in .env
- Or install Redis: `docker run -d -p 6379:6379 redis:alpine`

## 📖 Documentation

- **README.md**: Full documentation
- **ARCHITECTURE.md**: Architecture details
- **CHANGELOG.md**: Version history
- **Swagger**: http://localhost:3000/api-docs

## 🎉 You're Ready!

Framework sudah siap digunakan untuk membangun aplikasi backend yang scalable dan secure! 🚀
