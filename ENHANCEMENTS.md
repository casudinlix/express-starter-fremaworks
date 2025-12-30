# Framework Enhancements - Pino, Knex, RBAC, and API Keys

## 🎉 New Features Added

### 1. ✅ Pino Logger with Rotation
Mengganti Winston dengan Pino untuk performa logging yang lebih baik:
- **Rotating file stream** - Log files dirotasi otomatis (10MB per file, max 10 files)
- **Compression** - File lama di-compress dengan gzip
- **Pretty printing** - Output yang cantik di development
- **HTTP middleware** - Automatic request/response logging

**Usage:**
```typescript
import logger from './shared/utils/pinoLogger';

logger.info('Info message');
logger.error('Error message', error);
logger.warn('Warning message');
logger.debug('Debug message');
```

### 2. ✅ Knex.js for Database Operations
Mengganti TypeORM dengan Knex.js untuk operasi database yang lebih fleksibel:
- **Query builder** yang powerful
- **Migration system** dengan rollback support
- **Seed system** untuk sample data
- **Multi-database support** (PostgreSQL & MySQL)

**Commands:**
```bash
# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name

# Run seeders
npm run seed

# Create new seeder
npm run seed:make seeder_name
```

### 3. ✅ Global Database Helpers
Helper functions untuk mempermudah operasi database di models:

```typescript
import { DbHelpers } from './infrastructure/database/knex/helpers';

// Find one
const user = await DbHelpers.findOne('users', { email: 'user@example.com' });

// Find by ID
const user = await DbHelpers.findById('users', userId);

// Create
const newUser = await DbHelpers.create('users', { email, password, name });

// Update
await DbHelpers.updateById('users', userId, { name: 'New Name' });

// Delete
await DbHelpers.deleteById('users', userId);

// Soft delete
await DbHelpers.softDeleteById('users', userId);

// Paginate
const result = await DbHelpers.paginate('users', 1, 10);

// Count
const total = await DbHelpers.count('users', { is_active: true });

// Exists
const exists = await DbHelpers.exists('users', { email });

// Transaction
await DbHelpers.transaction(async (trx) => {
  await trx('users').insert(userData);
  await trx('user_roles').insert(roleData);
});
```

### 4. ✅ API Key Middleware (x-api-key)
Middleware untuk verifikasi API key selain Bearer token:

**Usage:**
```typescript
import { verifyApiKey, verifyBearerOrApiKey } from './shared/middlewares/apiKey.middleware';

// Require API key only
router.get('/endpoint', verifyApiKey, handler);

// Accept either Bearer token OR API key
router.get('/endpoint', verifyBearerOrApiKey, handler);
```

**Request Example:**
```bash
curl -H "x-api-key: sk_test_your_api_key" http://localhost:3000/api/v1/endpoint
```

### 5. ✅ Complete Auth Service
Service lengkap untuk authentication dan authorization:

**Features:**
- User registration dengan auto-assign role
- Login dengan credential validation
- Get user profile dengan roles dan permissions
- Generate API key untuk user
- Check user permissions
- Check user roles

**Usage:**
```typescript
import { AuthService } from './application/services/auth.service';

// Register
const { user, tokens } = await AuthService.register({
  email: 'user@example.com',
  password: 'Password123!',
  name: 'John Doe',
  phone: '+6281234567890'
});

// Login
const { user, tokens } = await AuthService.login({
  email: 'user@example.com',
  password: 'Password123!'
});

// Get profile with roles and permissions
const profile = await AuthService.getProfile(userId);

// Generate API key
const apiKey = await AuthService.generateApiKey(userId, 'My API Key', 90);

// Check permission
const hasPermission = await AuthService.hasPermission(userId, 'users.create');

// Check role
const hasRole = await AuthService.hasRole(userId, 'admin');
```

### 6. ✅ RBAC (Role-Based Access Control)
Sistem RBAC lengkap dengan roles, permissions, dan middleware:

**Database Structure:**
- `users` - User data
- `roles` - Role definitions (super-admin, admin, manager, user)
- `permissions` - Permission definitions (users.view, users.create, etc.)
- `user_roles` - User-Role relationships
- `role_permissions` - Role-Permission relationships

**Middleware Usage:**
```typescript
import { requireRole, requirePermission } from './shared/middlewares/rbac.middleware';

// Require specific role
router.get('/admin-only', authenticate, requireRole('admin', 'super-admin'), handler);

// Require specific permission
router.post('/users', authenticate, requirePermission('users.create'), handler);
```

### 7. ✅ Database Seeders
Sample data untuk testing:

**Roles:**
- Super Admin - Full access
- Admin - Most permissions
- Manager - Limited permissions
- User - Basic permissions

**Sample Users:**
| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | Password123! | super-admin |
| admin@example.com | Password123! | admin |
| manager@example.com | Password123! | manager |
| user@example.com | Password123! | user |

**Run Seeders:**
```bash
npm run seed
```

## 📁 New File Structure

```
Node-framework/
├── knexfile.ts                          # Knex configuration
├── src/
│   ├── application/
│   │   └── services/
│   │       └── auth.service.ts          # Complete auth service
│   ├── infrastructure/
│   │   └── database/
│   │       └── knex/
│   │           ├── knex.ts              # Knex singleton
│   │           ├── helpers.ts           # Global DB helpers
│   │           ├── migrations/          # Database migrations
│   │           │   ├── 20240101000001_create_users_table.ts
│   │           │   ├── 20240101000002_create_roles_table.ts
│   │           │   ├── 20240101000003_create_permissions_table.ts
│   │           │   ├── 20240101000004_create_user_roles_table.ts
│   │           │   ├── 20240101000005_create_role_permissions_table.ts
│   │           │   └── 20240101000006_create_api_keys_table.ts
│   │           └── seeds/               # Database seeders
│   │               ├── 01_roles_and_permissions.ts
│   │               └── 02_users.ts
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── apiKey.middleware.ts     # API key verification
│   │   │   └── rbac.middleware.ts       # RBAC middleware
│   │   └── utils/
│   │       └── pinoLogger.ts            # Pino logger
│   └── presentation/
│       ├── controllers/
│       │   └── auth.controller.ts       # Updated auth controller
│       └── routes/
│           ├── auth.routes.ts           # Updated auth routes
│           └── example.routes.ts        # RBAC examples
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Node-framework
npm install
```

### 2. Setup Database
```bash
# Using Docker
docker-compose up -d postgres

# Or use your own PostgreSQL/MySQL
```

### 3. Run Migrations
```bash
npm run migrate
```

### 4. Run Seeders
```bash
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

## 🧪 Testing the New Features

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User",
    "phone": "+6281234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "Password123!"
  }'
```

### 3. Get Profile (with Bearer Token)
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Generate API Key
```bash
curl -X POST http://localhost:3000/api/v1/auth/api-key \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "expiresInDays": 90
  }'
```

### 5. Use API Key
```bash
curl http://localhost:3000/api/v1/examples/api-key \
  -H "x-api-key: YOUR_API_KEY"
```

### 6. Test RBAC (Admin Only)
```bash
curl http://localhost:3000/api/v1/examples/admin-only \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 7. Test Permission Check
```bash
curl http://localhost:3000/api/v1/examples/permission-check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Database Schema

### Users Table
- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `name`
- `phone`
- `is_active`
- `email_verified`
- `email_verified_at`
- `last_login_at`
- `created_at`
- `updated_at`
- `deleted_at`

### Roles Table
- `id` (UUID)
- `name`
- `slug` (unique)
- `description`
- `created_at`
- `updated_at`

### Permissions Table
- `id` (UUID)
- `name`
- `slug` (unique)
- `resource`
- `action`
- `description`
- `created_at`
- `updated_at`

### API Keys Table
- `id` (UUID)
- `user_id` (FK to users)
- `name`
- `key` (unique, indexed)
- `is_active`
- `expires_at`
- `last_used_at`
- `created_at`
- `updated_at`

## 🔒 Security Features

1. **Password Hashing** - Bcrypt dengan 10 rounds
2. **JWT Tokens** - Access & refresh tokens
3. **API Key Expiration** - Configurable expiration
4. **Role-Based Access** - Fine-grained permissions
5. **Soft Deletes** - Data tidak benar-benar dihapus
6. **Activity Tracking** - Last login, last API key usage

## 📝 Available Permissions

### User Permissions
- `users.view` - View users
- `users.create` - Create users
- `users.edit` - Edit users
- `users.delete` - Delete users

### Role Permissions
- `roles.view` - View roles
- `roles.create` - Create roles
- `roles.edit` - Edit roles
- `roles.delete` - Delete roles

### Permission Permissions
- `permissions.view` - View permissions
- `permissions.assign` - Assign permissions

### API Key Permissions
- `api-keys.view` - View API keys
- `api-keys.create` - Create API keys
- `api-keys.delete` - Delete API keys

### Profile Permissions
- `profile.view` - View own profile
- `profile.edit` - Edit own profile

## 🎯 Next Steps

1. **Add More Permissions** - Sesuaikan dengan kebutuhan aplikasi
2. **Create Admin Panel** - UI untuk manage users, roles, permissions
3. **Add Email Verification** - Verifikasi email saat register
4. **Add Password Reset** - Forgot password functionality
5. **Add 2FA** - Two-factor authentication
6. **Add OAuth** - Social login (Google, Facebook, etc.)

## 💡 Best Practices

1. **Always use helpers** - Gunakan DbHelpers untuk konsistensi
2. **Check permissions** - Selalu cek permission sebelum action
3. **Use transactions** - Untuk operasi yang melibatkan multiple tables
4. **Rotate API keys** - Ganti API key secara berkala
5. **Monitor logs** - Pino logs semua request dan error
6. **Use soft deletes** - Jangan hard delete data penting

## 🎉 Summary

Framework sekarang sudah dilengkapi dengan:
✅ Pino logger dengan file rotation  
✅ Knex.js untuk database operations  
✅ Global database helpers  
✅ API key authentication  
✅ Complete auth service  
✅ RBAC system  
✅ Database seeders  
✅ Sample users dan permissions  

Semua fitur sudah production-ready dan siap digunakan! 🚀
