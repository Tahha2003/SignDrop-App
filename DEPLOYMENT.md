# SignDrop Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`
6. Deploy! You'll get a URL like `https://your-app.up.railway.app`

**Cost:** Free tier available, ~$5/month for production use

### Option 2: Vercel + Separate Backend

**Frontend (Vercel):**
```bash
npm run build
vercel deploy
```

**Backend:** Deploy to Railway/Heroku separately and update API URLs

### Option 3: DigitalOcean Droplet (Self-Hosted)

**Requirements:**
- Ubuntu 22.04 server
- Domain name (optional)
- Basic Linux knowledge

**Setup:**
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-username/signdrop.git
cd signdrop

# Install dependencies
npm install

# Build frontend
npm run build

# Start with PM2
pm2 start server/index.js --name signdrop
pm2 startup
pm2 save

# Install Nginx
sudo apt install nginx

# Configure Nginx (see below)
```

**Nginx Configuration** (`/etc/nginx/sites-available/signdrop`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

**Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong environment variables
- [ ] Enable CORS only for your domain
- [ ] Add rate limiting
- [ ] Use a real database (PostgreSQL/MongoDB)
- [ ] Regular backups of signed documents
- [ ] Add authentication for lawyer dashboard
- [ ] Set file upload limits
- [ ] Add virus scanning for uploads
- [ ] Enable logging and monitoring

## Environment Variables

Create `.env` file:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key
MAX_FILE_SIZE=10485760
LINK_EXPIRY_DAYS=7
```

## Monitoring

**Check app status:**
```bash
pm2 status
pm2 logs signdrop
```

**View resource usage:**
```bash
pm2 monit
```

## Backup Strategy

**Automated daily backups:**
```bash
# Add to crontab
0 2 * * * tar -czf /backups/signdrop-$(date +\%Y\%m\%d).tar.gz /path/to/signdrop/uploads /path/to/signdrop/signed
```

## Updating the App

```bash
cd signdrop
git pull
npm install
npm run build
pm2 restart signdrop
```

## Cost Estimates

- **Railway/Heroku:** $5-10/month
- **DigitalOcean Droplet:** $6-12/month
- **Domain name:** $10-15/year
- **Total:** ~$10-20/month for professional hosting
