# 🚀 Railway Deployment Guide for contaLeve Backend

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click **"Create Account"**
3. Sign up with **GitHub** (easier - connects automatically)
4. Authorize Railway to access your GitHub repos

---

## Step 2: Create New Project

1. Click **"New Project"** (top-right)
2. Select **"Deploy from GitHub repo"**
3. Find and select **`GustavoMourao/contaLeve`**
4. Railway will auto-detect the `railway.json` file

---

## Step 3: Configure Services

Railway will automatically create two services:

### **Service 1: Backend (FastAPI)**
- Detected automatically from `railway.json`
- Dockerfile: `backend/Dockerfile`
- Port: 8000

### **Service 2: PostgreSQL Database**
1. Click **"Add Service"** in Railway dashboard
2. Select **"Add from Marketplace"**
3. Search and add **"PostgreSQL"**
4. Railway auto-generates:
   - Database URL
   - Username
   - Password
   - Port

---

## Step 4: Set Environment Variables

### For **Backend Service**:

1. Click on **Backend service** in dashboard
2. Go to **"Variables"** tab
3. Add these variables:

```
DATABASE_URL=
DEBUG=false
SECRET_KEY=your-secure-random-key-here
```

**How to get DATABASE_URL:**
1. Click on **PostgreSQL service** in dashboard
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value
4. Paste it in Backend's `DATABASE_URL` variable

**For SECRET_KEY:** Generate a random secure string, e.g.:
```
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Step 5: Deploy

1. Push this file to your GitHub repo:
   ```bash
   git add railway.json RAILWAY_DEPLOYMENT.md
   git commit -m "Add Railway deployment config"
   git push origin main
   ```

2. Railway automatically triggers a deployment
3. Watch the **Build** logs in Railway dashboard
4. Once build succeeds, service goes **live**

---

## Step 6: Get Your Backend URL

1. Go to Railway dashboard
2. Click **Backend service**
3. Go to **"Deployments"** tab
4. Look for **"Domains"** section
5. You'll see a URL like: `https://contaLeve-production.up.railway.app`

---

## Step 7: Connect Frontend to Backend

1. Update your Vercel frontend `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://contaLeve-production.up.railway.app
   ```

2. Push to GitHub → Vercel auto-redeploys
3. Frontend now talks to your Railway backend! ✅

---

## 📊 Monitor Your Deployment

In Railway dashboard you can:
- ✅ View **live logs** (click Backend service → Logs)
- ✅ Check **CPU/Memory usage**
- ✅ View **deploy history**
- ✅ Set **restart policies**

---

## 🐛 Troubleshooting

### Build fails with "Port already in use"
- Railway automatically assigns `$PORT` env variable
- Our `railway.json` already handles this ✓

### Database connection error
- Make sure `DATABASE_URL` env var is set in Backend service
- Copy it from PostgreSQL service's Variables tab

### Frontend can't reach backend
- Check the backend URL is correct (no typos)
- Make sure `NEXT_PUBLIC_API_URL` is set in Vercel
- Test with: `curl https://your-backend-url/health`

### "503 Service Unavailable"
- Backend might be cold-starting (first request)
- Railway will warm it up automatically
- Check logs for errors

---

## 💰 Cost Breakdown

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Backend (FastAPI) | ~$2-3 | Within $5 free credit |
| PostgreSQL | ~$1-2 | Within $5 free credit |
| **Total** | **~$5** | **Stays in free tier!** |

---

## 🔄 Auto-Deploy on Every Push

Once connected, Railway automatically:
1. Detects changes on GitHub
2. Rebuilds Docker image
3. Deploys new version
4. Zero downtime ✅

---

## ✅ You're Done!

Your contaLeve stack is now:
- **Frontend**: ✅ Vercel (free)
- **Backend**: ✅ Railway (free)
- **Database**: ✅ Railway PostgreSQL (free)

All deployed and auto-updating with every push to `main`! 🚀
