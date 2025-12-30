# Node.js Backend Framework

Enterprise-grade Node.js backend framework with Domain-Driven Design (DDD) architecture, built with TypeScript.

## 🚀 Features

- ✅ **DDD Architecture** - Clean separation of concerns with Domain, Application, Infrastructure, and Presentation layers
- ✅ **Multi-Database Support** - PostgreSQL & MySQL (via Knex), MongoDB (via Mongoose)
- ✅ **JWT Authentication** - Secure authentication with access and refresh tokens
- ✅ **Socket.IO Integration** - Real-time communication with WebSocket support
- ✅ **OWASP Security** - Helmet, CORS, rate limiting, and input validation
- ✅ **Global Helpers** - Reusable utility functions to avoid code duplication
- ✅ **Migration System** - Database migrations with rollback support
- ✅ **Pre-commit Audit** - Automated code quality checks before git commits
- ✅ **Queue System** - BullMQ for background job processing
- ✅ **Global HTTP Service** - Axios-based HTTP client with interceptors
- ✅ **Swagger Documentation** - Auto-generated API documentation
- ✅ **Performance Optimized** - Compression, caching, and connection pooling
- ✅ **Comprehensive Logging** - Winston logger with file rotation
- ✅ **Validation** - Express-validator with custom validation rules
- ✅ **Testing** - Jest configuration for unit and integration tests
- ✅ **Advanced Pagination** - Standardized pagination with filtering and sorting
- ✅ **Auto Unused Imports** - Automatically removes unused imports on save

## 📁 Project Structure

```
Node-framework/
├── src/
│   ├── config/                 # Configuration management
│   ├── domain/                 # Domain layer (entities, value objects)
│   ├── application/            # Application layer (use cases, services)
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── database/          # Database connections and migrations
│   │   ├── cache/             # Redis caching
│   │   ├── auth/              # JWT authentication
│   │   ├── socket/            # Socket.IO service
│   │   ├── queue/             # Queue service
│   │   ├── http/              # HTTP service
│   │   └── swagger/           # Swagger configuration
│   ├── presentation/           # Presentation layer
│   │   ├── controllers/       # Route controllers
│   │   └── routes/            # API routes
│   ├── shared/                 # Shared utilities
│   │   ├── errors/            # Custom error classes
│   │   ├── middlewares/       # Express middlewares
│   │   └── utils/             # Helper functions
│   └── index.ts               # Application entry point
├── scripts/                    # Utility scripts
│   └── audit.ts               # Pre-commit audit script
├── .husky/                     # Git hooks
└── logs/                       # Application logs
```

## 🛠️ Installation

1. **Clone the repository**

```bash
cd Node-framework
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup Husky (Git hooks)**

```bash
pnpm run prepare
```

## 🚀 Usage

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm run build
pnpm start
```

### Database Migrations

```bash
# Run migrations
pnpm run migrate

# Rollback last migration
pnpm run migrate:rollback
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## 🔒 Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Sanitize and validate all inputs
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with configurable rounds
- **XSS Protection** - Prevent cross-site scripting
- **SQL Injection Prevention** - Parameterized queries

## 🗄️ Database Support

Configure your database in `.env`:

### PostgreSQL

```env
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=node_framework
```

### MySQL

```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=node_framework
```

### MongoDB

```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/node_framework
```

## 🔌 Socket.IO

Socket.IO is integrated with JWT authentication. Connect to the WebSocket server:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

## 📦 Queue System

Use the queue service for background jobs:

```typescript
import { QueueService } from './infrastructure/queue/queue.service';

// Add job to queue
await QueueService.addJob('email-queue', 'send-email', {
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Hello!',
});

// Create worker to process jobs
QueueService.createWorker('email-queue', async (job) => {
  const { to, subject, body } = job.data;
  // Send email logic here
  console.log(`Sending email to ${to}`);
});
```

## 🌐 HTTP Service

Make external API calls using the global HTTP service:

```typescript
import { HttpService } from './infrastructure/http/http.service';

// GET request
const data = await HttpService.get('/users');

// POST request
const result = await HttpService.post('/users', { name: 'John' });
```

## 🧪 Testing

Write tests using Jest:

```typescript
describe('AuthController', () => {
  it('should register a new user', async () => {
    // Test implementation
  });
});
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by Senior Backend Developer

## 🙏 Acknowledgments

- Express.js
- TypeScript
- Knex.js
- Mongoose
- Socket.IO
- BullMQ
- Winston
- Swagger
