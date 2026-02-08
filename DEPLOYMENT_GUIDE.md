# SignDrop Deployment Guide

This guide will help you deploy SignDrop so lawyers can use it to collect signatures from clients.

## Table of Contents

1. [Recommended Deployment Options](#recommended-deployment-options)
2. [Option 1: Render (Easiest - FREE)](#option-1-render-easiest---free)
3. [Option 2: Railway (Simple - $5/month)](#option-2-railway-simple---5month)
4. [Option 3: DigitalOcean (Full Control - $6/month)](#option-3-digitalocean-full-control---6month)
5. [After Deployment](#after-deployment)
6. [Giving Access to Lawyer](#giving-access-to-lawyer)

---

## Recommended Deployment Options

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Render** | FREE | ⭐ Easy | Testing, small usage |
| **Railway** | $5/mo | ⭐⭐ Easy | Production, reliable |
| **DigitalOcean** | $6/mo | ⭐⭐⭐ Medium | Full control, scaling |

**Recommendation:** Start with **Render (FREE)** for testing, then move to **Railway** for production use.

---

## Option 1: Render (Easiest - FREE)

### Why Render?
- ✅ Completely FREE
- ✅ Automatic HTTPS
- ✅ Easy setup (5 minutes)
- ✅ Automatic deployments
- ⚠️ Sleeps after 15 min inactivity (wakes up in ~30 seconds)

### Step-by-Step Deployment

#### 1. Prepare Your Code

First, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/signdrop.git
git push -u origin main
```

#### 2. Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest)

#### 3. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `signdrop` repository

#### 4. Configure Service

Fill in these settings:

- **Name:** `signdrop` (or your preferred name)
- **Region:** Choose closest to your location
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

#### 5. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these:

```
NODE_ENV = production
LAWYER_PASSWORD = your_secure_password_here
PORT = 3000
```

#### 6. Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://signdrop.onrender.com`

#### 7. Test Your Deployment

1. Visit your URL
2. You should see the login page
3. Login with your password
4. Upload a test PDF and try signing

### Important Notes for Render

⚠️ **Free tier limitations:**
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for one app)

💡 **Tip:** For production use, upgrade to paid plan ($7/month) to avoid sleeping.

---

## Option 2: Railway (Simple - $5/month)

### Why Railway?
- ✅ Always online (no sleeping)
- ✅ Automatic HTTPS
- ✅ Very easy setup
- ✅ Great for production
- ✅ $5 credit free trial

### Step-by-Step Deployment

#### 1. Prepare Your Code

Push to GitHub (same as Render instructions above)

#### 2. Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub

#### 3. Deploy from GitHub

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `signdrop` repository
4. Railway will auto-detect Node.js

#### 4. Add Environment Variables

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:

```
NODE_ENV = production
LAWYER_PASSWORD = your_secure_password_here
PORT = 3000
```

#### 5. Configure Build

Railway should auto-detect, but verify:

1. Go to **"Settings"** tab
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`

#### 6. Get Your URL

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://signdrop-production.up.railway.app`

#### 7. Test Your Deployment

Visit your URL and test the app

### Railway Pricing

- **Free:** $5 credit (lasts ~1 month)
- **Paid:** $5/month for hobby plan
- **Usage-based:** Pay only for what you use

---

## Option 3: DigitalOcean (Full Control - $6/month)

### Why DigitalOcean?
- ✅ Full server control
- ✅ Predictable pricing
- ✅ Can host multiple apps
- ✅ SSH access
- ⚠️ Requires more technical knowledge

### Step-by-Step Deployment

#### 1. Create DigitalOcean Account

1. Go to https://www.digitalocean.com
2. Sign up (get $200 credit for 60 days with referral)
3. Add payment method

#### 2. Create a Droplet

1. Click **"Create"** → **"Droplets"**
2. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month - 1GB RAM)
   - **Datacenter:** Closest to your location
   - **Authentication:** SSH Key (recommended) or Password
3. Click **"Create Droplet"**

#### 3. Connect to Your Server

```bash
# SSH into your server
ssh root@your_droplet_ip
```

#### 4. Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 5. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### 6. Clone Your Repository

```bash
# Install git
apt install -y git

# Clone your repo
cd /var/www
git clone https://github.com/YOUR_USERNAME/signdrop.git
cd signdrop
```

#### 7. Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the app
npm run build
```

#### 8. Create Environment File

```bash
nano .env
```

Add:
```
NODE_ENV=production
LAWYER_PASSWORD=your_secure_password_here
PORT=3000
```

Save: `Ctrl+X`, then `Y`, then `Enter`

#### 9. Start with PM2

```bash
pm2 start server/index.js --name signdrop
pm2 save
pm2 startup
```

#### 10. Install Nginx (Web Server)

```bash
apt install -y nginx
```

#### 11. Configure Nginx

```bash
nano /etc/nginx/sites-available/signdrop
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com;  # or your_droplet_ip

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and enable:
```bash
ln -s /etc/nginx/sites-available/signdrop /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 12. Setup Firewall

```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

#### 13. Install SSL Certificate (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d your_domain.com

# Auto-renewal is set up automatically
```

#### 14. Test Your Deployment

Visit `http://your_droplet_ip` or `https://your_domain.com`

---

## After Deployment

### 1. Change Default Password

The default password is `lawyer123`. Change it immediately:

**For Render/Railway:**
- Update the `LAWYER_PASSWORD` environment variable in dashboard
- Redeploy the app

**For DigitalOcean:**
```bash
nano .env
# Change LAWYER_PASSWORD value
pm2 restart signdrop
```

### 2. Test Everything

1. ✅ Login works
2. ✅ Upload PDF works
3. ✅ Generate signing link works
4. ✅ Client can sign (test the link)
5. ✅ Download signed PDF works
6. ✅ Delete document works

### 3. Setup Backups

**For Render/Railway:**
- Enable automatic backups in dashboard
- Or manually download `/data`, `/uploads`, `/signed` folders periodically

**For DigitalOcean:**
```bash
# Create backup script
nano /root/backup.sh
```

Add:
```bash
#!/bin/bash
cd /var/www/signdrop
tar -czf /root/backups/signdrop-$(date +%Y%m%d).tar.gz data/ uploads/ signed/
# Keep only last 7 days
find /root/backups -name "signdrop-*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x /root/backup.sh
mkdir -p /root/backups
crontab -e
# Add this line:
0 2 * * * /root/backup.sh
```

### 4. Monitor Your App

**Render/Railway:**
- Check logs in dashboard
- Set up email alerts

**DigitalOcean:**
```bash
# View logs
pm2 logs signdrop

# Monitor status
pm2 status

# Restart if needed
pm2 restart signdrop
```

---

## Giving Access to Lawyer

### What to Provide

Send the lawyer:

1. **The URL** of your deployed app
   - Example: `https://signdrop.onrender.com`
   - Or: `https://yourdomain.com`

2. **The Password**
   - The password you set in environment variables
   - Send via secure method (not email)

3. **The User Guide**
   - Send them `LAWYER_GUIDE.md`
   - Or print it as PDF

### Email Template

```
Subject: SignDrop - Your Digital Signature Platform

Hi [Lawyer Name],

Your digital signature platform is ready to use!

🔗 Access URL: https://your-signdrop-url.com
🔐 Password: [your_secure_password]

📖 User Guide: [Attach LAWYER_GUIDE.md or PDF]

How to get started:
1. Visit the URL above
2. Login with the password
3. Click "Upload New PDF"
4. Follow the guide for detailed instructions

The platform is available 24/7 and all your documents are saved permanently.

If you have any questions or issues, please let me know.

Best regards,
[Your Name]
```

### Training Session (Optional)

Schedule a 15-minute call to:
1. Show them how to login
2. Upload a test document
3. Place signature box
4. Generate and share link
5. Show them how to download signed PDFs

---

## Troubleshooting

### App Not Loading

**Check:**
- Is the deployment successful?
- Are environment variables set correctly?
- Check logs for errors

**Render/Railway:**
- View logs in dashboard
- Check deployment status

**DigitalOcean:**
```bash
pm2 logs signdrop
pm2 status
```

### Can't Login

**Check:**
- Is `LAWYER_PASSWORD` environment variable set?
- Try the default password: `lawyer123`
- Clear browser cache and try again

### Upload Fails

**Check:**
- File size (should be under 10MB)
- File type (must be PDF)
- Check server logs for errors

### Client Can't Sign

**Check:**
- Is the link copied correctly?
- Has the link expired? (7 days)
- Has it already been signed?

---

## Cost Comparison

| Platform | Monthly Cost | Setup Time | Maintenance |
|----------|-------------|------------|-------------|
| **Render (Free)** | $0 | 5 min | None |
| **Render (Paid)** | $7 | 5 min | None |
| **Railway** | $5 | 10 min | None |
| **DigitalOcean** | $6 | 30 min | Low |

---

## Recommendations by Use Case

### For Testing / Demo
→ **Render (Free)**
- Quick setup
- No cost
- Good enough for demos

### For Single Lawyer
→ **Railway ($5/month)**
- Always online
- Reliable
- Easy to manage

### For Law Firm (Multiple Lawyers)
→ **DigitalOcean ($12-24/month)**
- More resources
- Full control
- Can scale up

### For High Volume
→ **DigitalOcean + Database**
- Upgrade to 2GB RAM ($12/month)
- Add PostgreSQL database
- Setup load balancing

---

## Next Steps

1. ✅ Choose a deployment platform
2. ✅ Follow the deployment steps
3. ✅ Test everything thoroughly
4. ✅ Change default password
5. ✅ Setup backups
6. ✅ Give access to lawyer
7. ✅ Provide user guide
8. ✅ Monitor usage

---

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review deployment logs
3. Verify environment variables
4. Test with a fresh browser/incognito mode

For platform-specific help:
- **Render:** https://render.com/docs
- **Railway:** https://docs.railway.app
- **DigitalOcean:** https://docs.digitalocean.com

---

**You're ready to deploy SignDrop and help lawyers collect digital signatures!** 🚀
