# SignDrop

Minimal web app for collecting digital signatures and embedding them into PDF documents.

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Lawyer    │────────▶│   Server    │◀────────│   Client    │
│  Dashboard  │         │  (Express)  │         │  Sign Page  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │ 1. Upload PDF         │                        │
      │ 2. Set position       │                        │
      │────────────────────▶  │                        │
      │                       │                        │
      │ 3. Get secure link    │                        │
      │◀──────────────────────│                        │
      │                       │                        │
      │ 4. Share link         │                        │
      │───────────────────────┼───────────────────────▶│
      │                       │                        │
      │                       │ 5. Client signs        │
      │                       │◀───────────────────────│
      │                       │                        │
      │ 6. Download signed    │                        │
      │◀──────────────────────│                        │
```

## API Routes

- `POST /api/upload` - Upload PDF and set signature position
- `GET /api/document/:token` - Get document info for signing
- `POST /api/sign/:token` - Submit signature and generate signed PDF
- `GET /api/download/:documentId` - Download signed PDF
- `GET /api/documents` - List all documents (lawyer view)

## Setup

```bash
npm install
npm run dev
```

Server runs on http://localhost:3000
Client runs on http://localhost:5173

## For Production Use

See **DEPLOYMENT.md** for detailed deployment instructions.

**Quick options:**
- Railway (easiest): One-click deploy
- DigitalOcean: Self-hosted with full control
- Vercel: Frontend hosting

**Security features included:**
- Rate limiting (prevents abuse)
- Helmet.js (security headers)
- HTTPS ready
- Expiring links (7 days)
- One-time use tokens

## Giving to a Lawyer

1. **Deploy the app** (see DEPLOYMENT.md)
2. **Share the URL** with the lawyer
3. **Provide LAWYER_GUIDE.md** for instructions
4. **Set up backups** for signed documents
5. **Enable HTTPS** (required for production)

**Recommended setup:**
- Deploy on Railway ($5/month)
- Add custom domain (optional)
- Enable automatic backups
- Monitor usage via Railway dashboard

## Documentation

- **README.md** - This file (overview)
- **DEPLOYMENT.md** - How to deploy for production
- **LAWYER_GUIDE.md** - User guide for lawyers
- **.env.example** - Environment variables template

## Deployment

```bash
npm run build
npm start
```

Set `NODE_ENV=production` for production deployment.
