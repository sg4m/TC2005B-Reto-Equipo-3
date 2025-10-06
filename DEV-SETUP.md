# Development Setup - Quick Start Guide

## Starting Both Frontend and Backend

You now have several ways to start both the frontend and backend servers simultaneously:

### Option 1: npm run dev (Recommended)
```bash
npm run dev
```
This uses `concurrently` to run both servers with colored output and proper process management.

### Option 2: PowerShell Script
```powershell
.\start-dev.ps1
```

### Option 3: Batch File (Windows)
```cmd
start-dev.bat
```

### Option 4: Manual (Individual Commands)
**Terminal 1 - Frontend:**
```bash
npm run dev:frontend
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
```

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend (Vite dev server)
- `npm run dev:backend` - Start only backend (Node.js with nodemon)
- `npm run build` - Build frontend for production
- `npm run start:backend` - Start backend in production mode
- `npm run install:backend` - Install backend dependencies

## Servers Information

- **Frontend**: http://localhost:5173 (Vite development server)
- **Backend**: http://localhost:5000 (Express.js API server)

## First Time Setup

1. Install main dependencies: `npm install`
2. Install backend dependencies: `npm run install:backend`
3. Start development: `npm run dev`

Both servers will start automatically and you'll see logs from both in the same terminal with color-coded prefixes.