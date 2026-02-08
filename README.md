# SignDrop

A secure web application for lawyers to collect digital signatures on PDF documents. Upload a PDF, place a signature box, generate a signing link, and receive signed documents back.

## Features

- 🔐 **Password-protected lawyer dashboard** - Secure access with authentication
- 📄 **PDF signature placement** - Visual editor to position signature boxes
- 🔗 **Unique signing links** - Generate secure, expiring links for clients
- ✍️ **Draw or upload signatures** - Clients can draw or upload signature images
- 📱 **Mobile-friendly** - Works on desktop, tablet, and mobile devices
- 📥 **Download signed PDFs** - Instant access to signed documents
- 🗑️ **Document management** - View, delete, and manage all documents
- 💾 **Persistent storage** - Documents saved permanently, survive server restarts
- ⏰ **Auto-expiring links** - Links expire after 7 days for security
- 🛡️ **Rate limiting** - Protection against abuse and spam

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

- **Server:** http://localhost:3000
- **Client:** http://localhost:5173

### Default Login

- **Password:** `lawyer123`
- **Change it:** Set `LAWYER_PASSWORD` environment variable

### Data Persistence

All documents are automatically saved to `/data/documents.json`:
- ✅ Survives server restarts
- ✅ Persists after logout
- ✅ No database setup required
- ✅ Human-readable JSON format

**Important:** Backup these folders regularly:
- `/data` - Document metadata
- `/uploads` - Original PDFs
- `/signed` - Signed PDFs

## How It Works

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Lawyer    │────────▶│   Server    │◀────────│   Client    │
│  Dashboard  │         │  (Express)  │         │  Sign Page  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │ 1. Login              │                        │
      │ 2. Upload PDF         │                        │
      │ 3. Place signature    │                        │
      │────────────────────▶  │                        │
      │                       │                        │
      │ 4. Get signing link   │                        │
      │◀──────────────────────│                        │
      │                       │                        │
      │ 5. Share link         │                        │
      │───────────────────────┼───────────────────────▶│
      │                       │                        │
      │                       │ 6. Client signs        │
      │                       │◀───────────────────────│
      │                       │                        │
      │ 7. Download signed    │                        │
      │◀──────────────────────│                        │
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login to lawyer dashboard
- `GET /api/auth/verify` - Verify authentication token

### Document Management
- `POST /api/upload` - Upload PDF and set signature position (requires auth)
- `GET /api/documents` - List all documents (requires auth)
- `GET /api/document/details/:documentId` - Get document details (requires auth)
- `DELETE /api/document/:documentId` - Delete document (requires auth)

### Signing
- `GET /api/document/:token` - Get document info for signing (public)
- `POST /api/sign/:token` - Submit signature and generate signed PDF (public)
- `GET /api/download/:documentId` - Download signed PDF (requires auth)

## Environment Variables

Create a `.env` file:

```env
PORT=3000
LAWYER_PASSWORD=your_secure_password_here
NODE_ENV=production
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Options

**Railway (Recommended)**
- One-click deploy
- Automatic HTTPS
- $5/month

**DigitalOcean**
- Full control
- Self-hosted
- $6/month

**Render**
- Free tier available
- Automatic deployments

### Security Checklist

- ✅ Change default password
- ✅ Enable HTTPS
- ✅ Set up backups for `/uploads`, `/signed`, and `/data` folders
- ✅ Configure rate limiting
- ✅ Monitor server logs
- ✅ Keep dependencies updated

## Project Structure

```
signdrop/
├── server/
│   └── index.js           # Express server & API
├── src/
│   ├── components/
│   │   ├── LawyerDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── PDFUploader.jsx
│   │   ├── SignPage.jsx
│   │   ├── SignatureCanvas.jsx
│   │   ├── DocumentList.jsx
│   │   ├── DocumentDetailsModal.jsx
│   │   └── SignSuccess.jsx
│   ├── App.jsx
│   └── main.jsx
├── uploads/               # Original PDFs
├── signed/                # Signed PDFs
├── data/                  # Database (documents.json)
├── package.json
└── README.md
```

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, React Router
- **Backend:** Node.js, Express
- **PDF Processing:** pdf-lib, PDF.js
- **Database:** JSON file storage (persistent)
- **Security:** Helmet, express-rate-limit
- **Icons:** Lucide React

## Data Storage

SignDrop uses a simple JSON file database for persistence:

- **Location:** `/data/documents.json`
- **Format:** Human-readable JSON
- **Automatic:** Saves on every change
- **Reliable:** Loads on server startup

**Benefits:**
- No database server required
- Easy to backup (just copy files)
- Portable across systems
- Simple to inspect and debug

**For production with high volume**, consider migrating to:
- PostgreSQL
- MongoDB
- MySQL

## Documentation

- **README.md** - Project overview (this file)
- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions for all platforms
- **QUICK_START_CHECKLIST.md** - Step-by-step checklist for deployment
- **LAWYER_GUIDE.md** - Step-by-step guide for lawyers
- **.env.example** - Environment variables template

## Quick Links

- 🚀 [Deploy Your App](DEPLOYMENT_GUIDE.md) - Choose Render (FREE), Railway ($5/mo), or DigitalOcean ($6/mo)
- ✅ [Deployment Checklist](QUICK_START_CHECKLIST.md) - Follow step-by-step
- 👨‍⚖️ [Lawyer User Guide](LAWYER_GUIDE.md) - Give this to lawyers

## Backup & Maintenance

### What to Backup

Always backup these three folders:

```bash
/data/          # Document database (documents.json)
/uploads/       # Original PDF files
/signed/        # Signed PDF files
```

### Backup Methods

**Manual Backup:**
```bash
# Copy folders to backup location
cp -r data/ uploads/ signed/ /path/to/backup/
```

**Automated Backup (Linux/Mac):**
```bash
# Add to crontab for daily backups
0 2 * * * tar -czf backup-$(date +\%Y\%m\%d).tar.gz data/ uploads/ signed/
```

**Cloud Backup:**
- Use your hosting provider's backup feature
- Sync to cloud storage (Dropbox, Google Drive)
- Use automated backup services

### Restore from Backup

```bash
# Stop the server first
# Copy backup folders back
cp -r /path/to/backup/data/ ./
cp -r /path/to/backup/uploads/ ./
cp -r /path/to/backup/signed/ ./
# Restart the server
```

## Support

For issues or questions, check the documentation or review the code comments.

## License

MIT License - Free to use and modify.
