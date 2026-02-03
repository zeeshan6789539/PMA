# Express Backend with PostgreSQL & Prisma

A robust Express.js backend server with PostgreSQL database, Prisma ORM, and comprehensive user management system with role-based access control.

## Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **PostgreSQL** - Reliable relational database
- ✅ **Prisma ORM** - Type-safe database client
- ✅ **Global Error Handling** - Centralized error management
- ✅ **Global Try-Catch** - Automatic async error catching
- ✅ **Consistent API Responses** - Standardized response format
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Role-based Authorization** - USER, ADMIN, SUPERADMIN roles
- ✅ **Permission Management** - Granular permission system
- ✅ **User Management** - Complete user CRUD operations
- ✅ **Input Validation** - Request validation with express-validator
- ✅ **Rate Limiting** - API rate limiting protection
- ✅ **Security Middleware** - Helmet, CORS, and other security features
- ✅ **Database Migrations** - Prisma migrations for schema changes
- ✅ **Database Seeders** - Sample data for development
- ✅ **Logging** - Request logging with Morgan
- ✅ **Environment Configuration** - Environment-based settings

## API Response Format

All API endpoints return responses in the following consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info (development only)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd express-setup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/express_backend?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:studio` - Open Prisma Studio for database management

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get current user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change user password | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users (with pagination) | ADMIN, SUPERADMIN |
| GET | `/api/users/:id` | Get user by ID | ADMIN, SUPERADMIN, or own profile |
| POST | `/api/users` | Create new user | SUPERADMIN only |
| PUT | `/api/users/:id` | Update user | ADMIN, SUPERADMIN, or own profile |
| DELETE | `/api/users/:id` | Delete user | SUPERADMIN only |
| PATCH | `/api/users/:id/password` | Change user password | ADMIN, SUPERADMIN, or own password |
| GET | `/api/users/:id/permissions` | Get user permissions | ADMIN, SUPERADMIN, or own permissions |

### Permission Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/permissions` | Get all permissions | ADMIN, SUPERADMIN |
| POST | `/api/permissions` | Create new permission | SUPERADMIN only |
| POST | `/api/permissions/grant-role` | Grant permission to role | SUPERADMIN only |
| DELETE | `/api/permissions/role/:role/:permissionId` | Revoke permission from role | SUPERADMIN only |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (USER/ADMIN/SUPERADMIN)
- `isActive` - Account status
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Permissions Table
- `id` - Unique identifier (CUID)
- `name` - Permission name (e.g., "user.create")
- `description` - Permission description
- `resource` - Resource type (e.g., "user", "permission")
- `action` - Action type (e.g., "create", "read", "update", "delete")
- `createdAt` - Permission creation timestamp
- `updatedAt` - Last update timestamp

### RolePermissions Table
- `id` - Unique identifier (CUID)
- `role` - Role enum value (USER/ADMIN/SUPERADMIN)
- `permissionId` - Reference to permission (foreign key)
- `createdAt` - Assignment timestamp

## User Roles & Permissions

### Roles
- **USER** - Basic user with limited access
- **ADMIN** - Administrative user with user management capabilities
- **SUPERADMIN** - Super administrator with full system access

### Default Permissions
The system comes with pre-configured permissions:
- `user.create` - Create new users
- `user.read` - Read user information
- `user.update` - Update user information
- `user.delete` - Delete users
- `permission.create` - Create new permissions
- `permission.read` - Read permission information
- `permission.grant` - Grant permissions to users
- `permission.revoke` - Revoke permissions from users

### Default Users (after seeding)
- **Super Admin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **User**: `john@example.com` / `password123`
- **User**: `jane@example.com` / `password123`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Sample API Usage

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "password123"
  }'
```

### Create a new user (SUPERADMIN only)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin-jwt-token>" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

### Get all users (ADMIN/SUPERADMIN)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### Create a new permission (SUPERADMIN only)
```bash
curl -X POST http://localhost:3000/api/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin-jwt-token>" \
  -d '{
    "name": "post.create",
    "description": "Create new posts",
    "resource": "post",
    "action": "create"
  }'
```

### Grant permission to role (SUPERADMIN only)
```bash
curl -X POST http://localhost:3000/api/permissions/grant-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin-jwt-token>" \
  -d '{
    "role": "ADMIN",
    "permissionId": "permission-id-here"
  }'
```

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors** - Input validation failures
- **Authentication Errors** - Invalid or missing tokens
- **Authorization Errors** - Insufficient permissions
- **Not Found Errors** - Resource not found
- **Database Errors** - Database operation failures
- **Rate Limiting** - Too many requests

All errors are logged and return appropriate HTTP status codes with descriptive messages.

## Development

### Project Structure
```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management logic
│   └── permissionController.js # Permission management logic
├── database/
│   └── seeders/
│       └── index.js         # Database seeders
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── userRoutes.js        # User management routes
│   └── permissionRoutes.js  # Permission management routes
├── utils/
│   └── responseHandler.js   # Standardized response format
└── server.js               # Main application file
```

### Adding New Features

1. **Create a new model** in `prisma/schema.prisma`
2. **Run migration** with `npm run db:migrate`
3. **Create controller** in `src/controllers/`
4. **Create routes** in `src/routes/`
5. **Add validation** using express-validator
6. **Test endpoints** and update documentation

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Request sanitization
- **Password Hashing** - bcrypt for password security
- **JWT Tokens** - Secure authentication
- **Role-based Access** - Authorization control
- **Permission System** - Granular access control

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up database connection pooling
5. Use HTTPS in production
6. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 