# 🚀 Complete Vercel Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account with your project repository
- [ ] Vercel account (free at vercel.com)
- [ ] Backend deployed and accessible via HTTPS
- [ ] Database set up and accessible
- [ ] All environment variables ready

## Step 1: Prepare Your Repository

### 1.1 Clean up and commit changes
```bash
# Remove debug info (if you added any)
# Clean build artifacts
npm run clean

# Add all files to git
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 Verify build works locally
```bash
# Test the production build
npm run build
npm run preview

# Visit http://localhost:4173 to test
```

## Step 2: Deploy Backend First

### 2.1 Choose Backend Hosting (Pick One)

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `Backend` folder
6. Add PostgreSQL service
7. Set environment variables (see BACKEND-PRODUCTION.md)

#### Option B: Heroku
1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect to GitHub repository
4. Enable automatic deploys from main branch
5. Add Heroku Postgres add-on
6. Set environment variables in Settings

#### Option C: DigitalOcean
1. Go to [digitalocean.com/products/app-platform](https://digitalocean.com/products/app-platform)
2. Create app from GitHub repository
3. Select Backend folder
4. Add managed PostgreSQL database
5. Configure environment variables

### 2.2 Required Backend Environment Variables
```bash
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### 2.3 Test Backend
After deployment, test your backend:
```bash
# Replace YOUR_BACKEND_URL with your actual URL
curl https://YOUR_BACKEND_URL.com/api/health

# Should return: {"status": "OK", "message": "Server and database are healthy"}
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will detect it's a Vite project automatically

### 3.2 Configure Build Settings
1. **Root Directory**: Leave empty (use root)
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### 3.3 Set Environment Variables in Vercel
In Vercel dashboard → Project Settings → Environment Variables:

```bash
# Production API URL (replace with your backend URL)
VITE_API_BASE_URL=https://your-backend-url.railway.app/api

# Environment
NODE_ENV=production
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a URL like `https://your-project.vercel.app`

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown by Vercel
4. Wait for SSL certificate (automatic)

### 4.2 Update Backend CORS
Update your backend CORS settings to include your new domain:
```javascript
const corsOptions = {
  origin: [
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'  // if using custom domain
  ],
  credentials: true
};
```

## Step 5: Verification and Testing

### 5.1 Test All Functionality
Visit your deployed app and test:
- [ ] User registration and login
- [ ] Business rules creation and editing
- [ ] Simulation functionality with file upload
- [ ] Reports generation and export
- [ ] All navigation and UI components

### 5.2 Performance Check
1. Open browser DevTools
2. Check Network tab for:
   - Fast load times (< 3 seconds)
   - Proper caching headers
   - No failed requests

### 5.3 Security Check
- [ ] HTTPS enabled (green lock icon)
- [ ] No console errors related to security
- [ ] API calls working properly
- [ ] File uploads working

## Step 6: Production Monitoring

### 6.1 Set Up Error Tracking
Consider adding error tracking services:
- **Sentry**: For error monitoring
- **LogRocket**: For user session recording
- **Vercel Analytics**: Built-in performance monitoring

### 6.2 Backend Monitoring
Monitor your backend with:
- **Railway Metrics** (if using Railway)
- **Heroku Metrics** (if using Heroku)
- **UptimeRobot**: For uptime monitoring

## Common Issues and Solutions

### Issue: "Cannot connect to backend"
**Solution**: 
1. Check VITE_API_BASE_URL is correct
2. Verify backend is accessible via browser
3. Check CORS settings in backend

### Issue: "Build failed on Vercel"
**Solution**:
1. Check build logs in Vercel dashboard
2. Run `npm run build` locally to test
3. Verify all dependencies are in package.json

### Issue: "Environment variables not working"
**Solution**:
1. Ensure variables start with `VITE_` for frontend
2. Redeploy after adding environment variables
3. Check variable names match exactly

### Issue: "Database connection failed"
**Solution**:
1. Verify database credentials
2. Check database is accessible from your hosting platform
3. Ensure database accepts connections from your backend host

## Final Checklist

Before going live:
- [ ] All tests passing locally
- [ ] Backend deployed and accessible
- [ ] Database migrations run
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All functionality tested in production
- [ ] Error monitoring set up
- [ ] Team access configured

## Maintenance

### Regular Tasks
1. **Update dependencies** monthly
2. **Monitor error logs** weekly
3. **Backup database** regularly
4. **Review performance metrics** monthly
5. **Update SSL certificates** (automatic with Vercel)

### Scaling Considerations
As your app grows, consider:
- **CDN** for faster global access
- **Database read replicas** for better performance
- **Caching layers** (Redis) for frequent data
- **Load balancing** for multiple backend instances

## Support

If you encounter issues:
1. Check Vercel documentation
2. Check your backend hosting platform docs
3. Review error logs in both platforms
4. Test locally to isolate issues

---

**🎉 Congratulations!** Your Banorte Business Rules application is now live on Vercel!

**Your app should be accessible at:**
- Production: `https://your-project.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)