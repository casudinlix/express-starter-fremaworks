# Refactoring to Modular Architecture with Repository Pattern

## 📁 New Directory Structure

```
src/
├── domain/
│   ├── interfaces/              # Interface definitions
│   │   ├── user/
│   │   │   └── user.interface.ts
│   │   ├── role/
│   │   │   └── role.interface.ts
│   │   ├── permission/
│   │   │   └── permission.interface.ts
│   │   ├── apiKey/
│   │   │   └── apiKey.interface.ts
│   │   └── auth/
│   │       └── auth.interface.ts
│   └── repositories/            # Repository implementations
│       ├── base.repository.ts   # Base repository with common methods
│       ├── user/
│       │   └── user.repository.ts
│       ├── role/
│       │   └── role.repository.ts
│       ├── permission/
│       │   └── permission.repository.ts
│       └── apiKey/
│           └── apiKey.repository.ts
├── application/
│   └── services/
│       └── auth.service.ts      # Uses repositories
└── shared/
    └── middlewares/
        └── apiKey.middleware.ts # Uses repositories
```

## 🎯 Repository Pattern Benefits

### 1. **Separation of Concerns**
- Interfaces define contracts
- Repositories handle data access
- Services handle business logic

### 2. **Reusability**
- BaseRepository provides common CRUD operations
- Specific repositories extend BaseRepository
- No code duplication

### 3. **Testability**
- Easy to mock repositories for testing
- Clear boundaries between layers

### 4. **Maintainability**
- Changes to data access logic in one place
- Easy to switch database implementations

## 📚 BaseRepository Methods

All repositories extend `BaseRepository<T>` and inherit these methods:

### Basic CRUD
- `findOne(criteria)` - Find one record
- `findAll(criteria?)` - Find all records
- `findById(id)` - Find by ID
- `create(data)` - Create new record
- `update(criteria, data)` - Update records
- `updateById(id, data)` - Update by ID
- `delete(criteria)` - Delete records
- `deleteById(id)` - Delete by ID

### Soft Delete
- `softDelete(criteria)` - Soft delete records
- `softDeleteById(id)` - Soft delete by ID

### Utilities
- `count(criteria?)` - Count records
- `exists(criteria)` - Check if exists
- `paginate(options, criteria?)` - Paginate results
- `raw(query, bindings?)` - Execute raw query
- `transaction(callback)` - Run transaction
- `bulkInsert(data[])` - Bulk insert
- `upsert(data, conflictColumns)` - Insert or update

## 🔧 Repository-Specific Methods

### UserRepository
```typescript
const userRepo = new UserRepository();

// Find by email
const user = await userRepo.findByEmail('user@example.com');

// Find active users
const activeUsers = await userRepo.findActive();

// Get user with roles and permissions
const profile = await userRepo.findWithRolesAndPermissions(userId);

// Assign role
await userRepo.assignRole(userId, roleId);

// Check permission
const hasPermission = await userRepo.hasPermission(userId, 'users.create');

// Check role
const hasRole = await userRepo.hasRole(userId, 'admin');
```

### RoleRepository
```typescript
const roleRepo = new RoleRepository();

// Find by slug
const role = await roleRepo.findBySlug('admin');

// Get role with permissions
const roleWithPerms = await roleRepo.findWithPermissions(roleId);

// Assign permission
await roleRepo.assignPermission(roleId, permissionId);

// Get permissions
const permissions = await roleRepo.getRolePermissions(roleId);
```

### PermissionRepository
```typescript
const permRepo = new PermissionRepository();

// Find by slug
const perm = await permRepo.findBySlug('users.create');

// Find by resource
const userPerms = await permRepo.findByResource('users');

// Find by resource and action
const perm = await permRepo.findByResourceAndAction('users', 'create');
```

### ApiKeyRepository
```typescript
const apiKeyRepo = new ApiKeyRepository();

// Find by key
const apiKey = await apiKeyRepo.findByKey('sk_...');

// Find active by key
const activeKey = await apiKeyRepo.findActiveByKey('sk_...');

// Find by user
const userKeys = await apiKeyRepo.findByUserId(userId);

// Update last used
await apiKeyRepo.updateLastUsed(keyId);

// Deactivate
await apiKeyRepo.deactivate(keyId);
```

## 💡 Usage in Services

### Before (Direct DB Access)
```typescript
// ❌ Old way - direct database access
const user = await db('users').where({ email }).first();
await db('users').insert(userData);
```

### After (Repository Pattern)
```typescript
// ✅ New way - using repository
const userRepo = new UserRepository();
const user = await userRepo.findByEmail(email);
await userRepo.createUser(userData);
```

## 🎨 Interface Usage

### Type Safety
```typescript
import { IUser, IUserCreate } from './domain/interfaces/user/user.interface';

// Type-safe user creation
const userData: IUserCreate = {
  email: 'user@example.com',
  password: 'hashedPassword',
  name: 'John Doe',
  phone: '+6281234567890'
};

const user: IUser = await userRepo.createUser(userData);
```

## 🔄 Migration from Old Code

### AuthService Migration
```typescript
// Before
const user = await DbHelpers.findOne('users', { email });

// After
const userRepo = new UserRepository();
const user = await userRepo.findByEmail(email);
```

### API Key Middleware Migration
```typescript
// Before
const keyRecord = await db('api_keys').where({ key }).first();

// After
const apiKeyRepo = new ApiKeyRepository();
const keyRecord = await apiKeyRepo.findActiveByKey(key);
```

## 📦 Package Manager Update

### Using pnpm
```bash
# Install dependencies
pnpm install

# Add package
pnpm add package-name

# Remove package
pnpm remove package-name

# Run scripts
pnpm dev
pnpm build
pnpm migrate
pnpm seed
```

### Using npx for Global Commands
All Knex commands now use `npx` to avoid global installation:
```bash
pnpm migrate        # npx knex migrate:latest
pnpm migrate:rollback  # npx knex migrate:rollback
pnpm seed           # npx knex seed:run
```

## 🎯 Best Practices

1. **Always use repositories** - Never access database directly in services
2. **Use interfaces** - Define clear contracts for data structures
3. **Extend BaseRepository** - Inherit common functionality
4. **Keep repositories focused** - One repository per entity
5. **Use dependency injection** - Initialize repositories in constructors
6. **Type everything** - Leverage TypeScript for type safety

## 🚀 Next Steps

1. Create more repositories as needed
2. Add unit tests for repositories
3. Implement caching layer in repositories
4. Add database query logging
5. Implement soft delete globally

## 📝 Summary

✅ Switched to `pnpm` package manager  
✅ All commands use `npx` for global tools  
✅ Created modular interface structure  
✅ Implemented BaseRepository pattern  
✅ Created specific repositories (User, Role, Permission, ApiKey)  
✅ Refactored AuthService to use repositories  
✅ Updated middlewares to use repositories  
✅ Full type safety with TypeScript interfaces  

Architecture sekarang lebih modular, maintainable, dan scalable! 🎉
