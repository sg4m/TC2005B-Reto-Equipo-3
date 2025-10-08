# Production Backend Deployment Guide

## Backend Hosting Options

### 1. Railway (Recommended)
- Easy PostgreSQL integration
- Automatic deployments from GitHub
- Built-in environment variable management

### 2. Heroku
- PostgreSQL add-on available
- Easy deployment with git
- Good for smaller applications

### 3. DigitalOcean App Platform
- Managed PostgreSQL service
- Simple deployment process
- Cost-effective

## Required Environment Variables for Production

Create these environment variables in your hosting platform:

```bash
# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password

# Security
JWT_SECRET=generate-a-secure-random-string-here
NODE_ENV=production

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=5000
```

## Security Recommendations

1. **Use strong JWT_SECRET** (32+ characters, random)
2. **Enable SSL/HTTPS** for all connections
3. **Set up CORS properly** for your frontend domain
4. **Use connection pooling** for database
5. **Enable rate limiting** for API endpoints
6. **Set up proper logging** and monitoring

## Database Setup

### Option 1: Managed PostgreSQL
1. Create managed PostgreSQL instance on your hosting platform
2. Run the migration script to create tables:
   ```sql
   -- Run Backend/migrations/create_simulation_table.sql
   ```

### Option 2: Free PostgreSQL Options
- **Supabase**: Free PostgreSQL with 500MB storage
- **ElephantSQL**: Free tier with 20MB storage
- **Aiven**: Free tier with limited usage

## Backend Package.json Updates

Add these production scripts to Backend/package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node migrations/run-migrations.js"
  }
}
```

## CORS Configuration for Production

Update Backend/server.js CORS settings:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app', 'https://your-custom-domain.com']
    : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```