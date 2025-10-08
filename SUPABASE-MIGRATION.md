# 🚀 Supabase Migration Guide for Banorte App

This guide will help you migrate your local PostgreSQL database to Supabase and prepare for Vercel deployment.

## 📋 Prerequisites

- [ ] Local PostgreSQL database running with your current data
- [ ] Node.js installed
- [ ] Backend dependencies installed (`npm install` in Backend folder)

## 🎯 Step-by-Step Migration Process

### Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Create account** (free tier is perfect)
3. **Create new project**
   - Choose a project name (e.g., "banorte-rules")
   - Select region closest to you
   - Create a secure database password (save this!)
   - Wait for project setup (2-3 minutes)

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. **Go to Settings → Database**
2. **Copy the following information:**
   ```
   Host: db.xxx.supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [your-password]
   ```

3. **Go to Settings → API**
4. **Copy the following:**
   ```
   Project URL: https://xxx.supabase.co
   Anon public key: eyJhbG...
   ```

### Step 3: Update Environment Variables

Update your `Backend/.env.production` file with Supabase credentials:

```bash
# Cloud Database Configuration (Supabase)
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password

# Supabase specific (for scripts)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

### Step 4: Export Your Current Data

1. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install required dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Run the export script:**
   ```bash
   node scripts/export-data.js
   ```

   This will create:
   - `database_export.json` (your data in JSON format)
   - `database_import.sql` (SQL statements for manual import)

### Step 5: Create Database Structure in Supabase

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project
2. Click **SQL Editor** in the sidebar
3. Copy and paste the contents of `migrations/supabase_migration.sql`
4. Click **Run** to create all tables and indexes

**Option B: Using psql command line**

```bash
psql "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres" -f migrations/supabase_migration.sql
```

### Step 6: Import Your Data

**Option A: Using the automated script**

```bash
# Make sure your .env.production has Supabase credentials
node scripts/supabase-setup.js
```

**Option B: Manual SQL import**

1. In Supabase SQL Editor
2. Copy and paste contents of `database_import.sql`
3. Run the queries

### Step 7: Test the Connection

1. **Update your local `.env` to point to Supabase temporarily:**
   ```bash
   # Copy Supabase credentials to your regular .env for testing
   ```

2. **Test your backend locally:**
   ```bash
   npm run dev
   ```

3. **Check if data loads properly:**
   - Visit your local app
   - Try logging in
   - Check if rules load in Reglas page

### Step 8: Verify Data Migration

In Supabase Dashboard:

1. **Go to Table Editor**
2. **Check each table:**
   - `usuario` - Should have your users
   - `reglanegocio` - Should have your business rules
   - `simulacion_reglas` - Should have simulation data (if any)

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test connection manually
psql "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

### Data Export Issues
- Make sure your local database is running
- Check credentials in `.env`
- Verify table names match your local schema

### Import Issues
- Check for special characters in data
- Verify JSON data is properly escaped
- Run migration script first to create tables

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Credentials copied and saved
- [ ] Environment variables updated
- [ ] Local data exported successfully
- [ ] Database structure created in Supabase
- [ ] Data imported to Supabase
- [ ] Backend tested with Supabase connection
- [ ] All functionality working (login, rules, etc.)

## 🚀 Next Steps

Once migration is complete:

1. **Deploy Backend** to Railway/Heroku with Supabase credentials
2. **Deploy Frontend** to Vercel
3. **Update CORS settings** in backend for Vercel domain
4. **Test full production environment**

## 📞 Need Help?

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all credentials are correct
3. Test connection using psql or Supabase dashboard
4. Check if all required tables exist in Supabase

---

**🎉 Once complete, your app will be ready for production deployment!**