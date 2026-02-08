# SignDrop Quick Start Checklist

Use this checklist to deploy SignDrop and give it to a lawyer.

## ☐ Phase 1: Preparation (5 minutes)

- [ ] Code is ready and tested locally
- [ ] Push code to GitHub repository
- [ ] Choose deployment platform (Render/Railway/DigitalOcean)
- [ ] Create account on chosen platform

## ☐ Phase 2: Deployment (10-30 minutes)

### If using Render (FREE):
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `LAWYER_PASSWORD=your_secure_password`
  - [ ] `PORT=3000`
- [ ] Deploy and wait for completion
- [ ] Copy the deployment URL

### If using Railway ($5/month):
- [ ] Create new project from GitHub
- [ ] Add environment variables (same as above)
- [ ] Generate domain
- [ ] Copy the deployment URL

### If using DigitalOcean ($6/month):
- [ ] Create droplet (Ubuntu 22.04)
- [ ] SSH into server
- [ ] Install Node.js, PM2, Nginx
- [ ] Clone repository
- [ ] Install dependencies and build
- [ ] Create .env file with variables
- [ ] Start with PM2
- [ ] Configure Nginx
- [ ] Setup SSL with Certbot
- [ ] Copy the domain/IP

## ☐ Phase 3: Testing (10 minutes)

- [ ] Visit the deployment URL
- [ ] Login page loads correctly
- [ ] Login with your password works
- [ ] Upload a test PDF
- [ ] Place signature box
- [ ] Generate signing link
- [ ] Open signing link in incognito/different browser
- [ ] Sign the document (draw or upload)
- [ ] Check document shows as "Signed" in dashboard
- [ ] Download signed PDF successfully
- [ ] Delete test document

## ☐ Phase 4: Security (5 minutes)

- [ ] Change default password from `lawyer123`
- [ ] Verify HTTPS is working (URL starts with https://)
- [ ] Test logout functionality
- [ ] Verify clients can't access dashboard without password
- [ ] Check that signing links work but dashboard requires login

## ☐ Phase 5: Backups (10 minutes)

### For Render/Railway:
- [ ] Enable automatic backups in platform dashboard
- [ ] Document how to download backups manually

### For DigitalOcean:
- [ ] Create backup script
- [ ] Schedule daily backups with cron
- [ ] Test backup restoration

## ☐ Phase 6: Documentation (5 minutes)

- [ ] Save deployment URL
- [ ] Save password securely
- [ ] Note platform login credentials
- [ ] Keep backup of environment variables
- [ ] Save SSH key (if using DigitalOcean)

## ☐ Phase 7: Handoff to Lawyer (15 minutes)

### Prepare:
- [ ] Print or PDF the LAWYER_GUIDE.md
- [ ] Write down the URL clearly
- [ ] Prepare password (don't email it)
- [ ] Schedule training call (optional)

### Send Email:
- [ ] Send deployment URL
- [ ] Send password via secure method (phone/SMS/in-person)
- [ ] Attach LAWYER_GUIDE.md
- [ ] Include your contact info for support

### Training (Optional):
- [ ] Schedule 15-minute video call
- [ ] Show how to login
- [ ] Demo uploading a document
- [ ] Demo placing signature box
- [ ] Demo generating and sharing link
- [ ] Show how to check status
- [ ] Show how to download signed PDFs
- [ ] Answer questions

## ☐ Phase 8: Monitoring (Ongoing)

### First Week:
- [ ] Check if lawyer logged in successfully
- [ ] Monitor for any errors in logs
- [ ] Ask for feedback
- [ ] Help with first few documents

### Ongoing:
- [ ] Check server status weekly
- [ ] Monitor storage usage
- [ ] Verify backups are running
- [ ] Update dependencies monthly
- [ ] Check for security updates

## Quick Reference

### Deployment URLs:
- **Render:** https://dashboard.render.com
- **Railway:** https://railway.app
- **DigitalOcean:** https://cloud.digitalocean.com

### Important Files to Backup:
- `/data/documents.json` - Document database
- `/uploads/*.pdf` - Original PDFs
- `/signed/*.pdf` - Signed PDFs
- `.env` - Environment variables

### Support Resources:
- **LAWYER_GUIDE.md** - User guide for lawyers
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **README.md** - Technical documentation

## Estimated Time

| Phase | Time |
|-------|------|
| Preparation | 5 min |
| Deployment (Render/Railway) | 10 min |
| Deployment (DigitalOcean) | 30 min |
| Testing | 10 min |
| Security | 5 min |
| Backups | 10 min |
| Documentation | 5 min |
| Handoff | 15 min |
| **Total (Render/Railway)** | **60 min** |
| **Total (DigitalOcean)** | **80 min** |

## Success Criteria

✅ **Deployment is successful when:**
- App loads at the URL
- Login works with password
- Can upload and sign documents
- HTTPS is enabled
- Backups are configured

✅ **Handoff is successful when:**
- Lawyer can login independently
- Lawyer understands basic workflow
- Lawyer has the user guide
- You're available for support

---

**Print this checklist and check off items as you complete them!**
