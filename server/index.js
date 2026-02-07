const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb } = require('pdf-lib');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development, configure properly in production
}));

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many uploads, please try again later'
});

const signLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 signatures per 15 minutes per IP
  message: 'Too many signature attempts, please try again later'
});

// Ensure directories exist
['uploads', 'signed', 'data'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/signed', express.static('signed'));

// Storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${uuidv4()}.pdf`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  cb(null, file.mimetype === 'application/pdf');
}});

// In-memory database (use real DB in production)
const documents = new Map();

// Upload PDF and create signing link
app.post('/api/upload', uploadLimiter, upload.single('pdf'), async (req, res) => {
  const { x, y, page, width, height } = req.body;
  const documentId = uuidv4();
  const token = uuidv4();
  
  // Load PDF to get actual page dimensions
  const pdfPath = path.join('uploads', req.file.filename);
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pdfPage = pdfDoc.getPages()[parseInt(page)];
  const pageHeight = pdfPage.getHeight();
  
  const doc = {
    id: documentId,
    token,
    filename: req.file.filename,
    originalName: req.file.originalname,
    signaturePosition: {
      x: parseFloat(x),
      y: parseFloat(y),
      page: parseInt(page),
      width: parseFloat(width) || 200,
      height: parseFloat(height) || 100,
      pageHeight: pageHeight
    },
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  documents.set(documentId, doc);
  
  res.json({
    documentId,
    signingLink: `${req.protocol}://${req.get('host')}/sign/${token}`
  });
});

// Get document info for signing
app.get('/api/document/:token', (req, res) => {
  const doc = Array.from(documents.values()).find(d => d.token === req.params.token);
  
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status === 'signed') return res.status(400).json({ error: 'Already signed' });
  if (new Date() > doc.expiresAt) return res.status(410).json({ error: 'Link expired' });
  
  res.json({
    originalName: doc.originalName,
    expiresAt: doc.expiresAt
  });
});

// Submit signature and generate signed PDF
app.post('/api/sign/:token', signLimiter, async (req, res) => {
  const { signatureData } = req.body;
  const doc = Array.from(documents.values()).find(d => d.token === req.params.token);
  
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status === 'signed') return res.status(400).json({ error: 'Already signed' });
  if (new Date() > doc.expiresAt) return res.status(410).json({ error: 'Link expired' });
  
  try {
    const pdfPath = path.join('uploads', doc.filename);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Convert base64 signature to PNG
    const signatureImage = await pdfDoc.embedPng(signatureData);
    const page = pdfDoc.getPages()[doc.signaturePosition.page];
    
    // Draw signature
    page.drawImage(signatureImage, {
      x: doc.signaturePosition.x,
      y: doc.signaturePosition.y,
      width: doc.signaturePosition.width,
      height: doc.signaturePosition.height
    });
    
    // Save signed PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedFilename = `signed-${doc.id}.pdf`;
    fs.writeFileSync(path.join('signed', signedFilename), signedPdfBytes);
    
    doc.status = 'signed';
    doc.signedFilename = signedFilename;
    doc.signedAt = new Date();
    
    res.json({ success: true, documentId: doc.id });
  } catch (error) {
    console.error('Signing error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
});

// Download signed PDF
app.get('/api/download/:documentId', (req, res) => {
  const doc = documents.get(req.params.documentId);
  
  if (!doc || doc.status !== 'signed') {
    return res.status(404).json({ error: 'Signed document not found' });
  }
  
  const filePath = path.join('signed', doc.signedFilename);
  res.download(filePath, `signed-${doc.originalName}`);
});

// List all documents (lawyer dashboard)
app.get('/api/documents', (req, res) => {
  const docs = Array.from(documents.values()).map(d => ({
    id: d.id,
    originalName: d.originalName,
    status: d.status,
    createdAt: d.createdAt,
    signedAt: d.signedAt,
    expiresAt: d.expiresAt
  }));
  
  res.json(docs);
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // In development, redirect non-API routes to Vite dev server
  app.get('/sign/*', (req, res) => {
    res.redirect(`http://localhost:5173${req.originalUrl}`);
  });
}

app.listen(PORT, () => {
  console.log(`SignDrop server running on port ${PORT}`);
});
