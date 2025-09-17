# Banorte Business Rules API Backend

## Setup Instructions

### 1. Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=reto_banorte
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=generate_a_secure_random_string
   ```

### 2. Database Setup
1. Make sure PostgreSQL is installed and running
2. Create the database:
   ```sql
   CREATE DATABASE reto_banorte;
   ```

3. Connect to the database and create the tables:

### 4. Run the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Business Rules
- `GET /api/rules` - Get all business rules
- `POST /api/rules` - Create new business rule (with file upload)
- `GET /api/rules/:id` - Get specific rule
- `PUT /api/rules/:id` - Update rule  
- `DELETE /api/rules/:id` - Delete rule

## Security Notes

- **Never commit `.env` files** - They contain sensitive database credentials
- The `.env` file is already added to `.gitignore`
- Use `.env.example` as a template for team members
- Generate a strong `JWT_SECRET` for production

## File Uploads

- Supported formats: CSV files
- Maximum file size: 10MB
- Upload directory: `./uploads/`
- Files are validated for type and size