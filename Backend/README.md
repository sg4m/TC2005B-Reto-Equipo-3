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
- `GET /api/health` - Detailed health check with database test

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Business Rules (with Gemini AI)
- `POST /api/rules/generate` - Generate business rules using Gemini AI (supports text prompts and CSV file uploads)
- `GET /api/rules/user/:usuario_id` - Get user's business rules
- `GET /api/rules/movements/:usuario_id` - Get recent rule movements for dashboard
- `POST /api/rules/:id/refine` - Refine existing rules with Gemini AI feedback
- `PATCH /api/rules/:id/status` - Update rule status

### AI Integration (Gemini)
- `GET /api/ai/gemini-info` - Check Gemini AI configuration and capabilities
- `POST /api/ai/test-gemini` - Test Gemini AI with a custom prompt

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

## Gemini AI Integration

### Features
- **Text-to-Rules**: Generate business rules from natural language prompts
- **CSV Analysis**: Analyze CSV files and generate relevant business rules
- **Rule Refinement**: Improve existing rules based on user feedback
- **Banking Focus**: Specialized in generating rules for:
  - Fraud detection
  - Risk management  
  - Compliance requirements
  - Customer service
  - Data validation

### Usage Examples

#### Generate Rules from Text:
```bash
POST /api/rules/generate
{
  "usuario_id": 1,
  "nombre": "Fraud Detection Rule",
  "prompt_texto": "Create a rule to detect suspicious transactions over $10,000"
}
```

#### Generate Rules from CSV:
```bash
POST /api/rules/generate
Content-Type: multipart/form-data
- archivo: [CSV file]
- usuario_id: 1
- nombre: "Transaction Analysis"
- prompt_texto: "Analyze this transaction data for risk patterns"
```

#### Refine Existing Rules:
```bash
POST /api/rules/123/refine
{
  "feedback": "Make the rule more strict for international transactions"
}
```