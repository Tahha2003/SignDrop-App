const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb } = require('pdf-lib');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple password (use environment variable in production)
const LAWYER_PASSWORD = process.env.LAWYER_PASSWORD || 'lawyer123';

// Store active sessions (use Redis in production)
const sessions = new Map();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development, configure properly in production
}));

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later'
});

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

// Database file path
const DB_FILE = path.join('data', 'documents.json');

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

// Persistent database using JSON file
const documents = new Map();

// Load documents from file on startup
const loadDocuments = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      data.forEach(doc => {
        // Convert date strings back to Date objects
        doc.createdAt = new Date(doc.createdAt);
        doc.expiresAt = new Date(doc.expiresAt);
        if (doc.signedAt) doc.signedAt = new Date(doc.signedAt);
        documents.set(doc.id, doc);
      });
      console.log(`Loaded ${documents.size} documents from database`);
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
};

// Save documents to file
const saveDocuments = () => {
  try {
    const data = Array.from(documents.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving documents:', error);
  }
};

// Load documents on startup
loadDocuments();

// Authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  if (!sessions.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  next();
};

// Login endpoint
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body;

  if (password !== LAWYER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: new Date() });

  res.json({ token });
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  if (!sessions.has(token)) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  res.json({ valid: true });
});

// Upload PDF and create signing link
app.post('/api/upload', requireAuth, uploadLimiter, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
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
    saveDocuments(); // Save to file
    
    res.json({
      documentId,
      signingLink: `${req.protocol}://${req.get('host')}/sign/${token}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF: ' + error.message });
  }
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
    saveDocuments(); // Save to file
    
    res.json({ success: true, documentId: doc.id });
  } catch (error) {
    console.error('Signing error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
});

// Download signed PDF
app.get('/api/download/:documentId', requireAuth, (req, res) => {
  const doc = documents.get(req.params.documentId);
  
  if (!doc || doc.status !== 'signed') {
    return res.status(404).json({ error: 'Signed document not found' });
  }
  
  const filePath = path.join('signed', doc.signedFilename);
  res.download(filePath, `signed-${doc.originalName}`);
});

// List all documents (lawyer dashboard)
app.get('/api/documents', requireAuth, (req, res) => {
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

// Get document details (lawyer dashboard)
app.get('/api/document/details/:documentId', requireAuth, (req, res) => {
  const doc = documents.get(req.params.documentId);
  
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    id: doc.id,
    originalName: doc.originalName,
    status: doc.status,
    createdAt: doc.createdAt,
    signedAt: doc.signedAt,
    expiresAt: doc.expiresAt,
    signingLink: `${baseUrl}/sign/${doc.token}`,
    signaturePosition: doc.signaturePosition,
    originalPdfUrl: `${baseUrl}/uploads/${doc.filename}`,
    signedPdfUrl: doc.signedFilename ? `${baseUrl}/signed/${doc.signedFilename}` : null
  });
});

// Get document details
app.get('/api/document/details/:documentId', requireAuth, (req, res) => {
  const doc = documents.get(req.params.documentId);
  
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    id: doc.id,
    originalName: doc.originalName,
    filename: doc.filename,
    signedFilename: doc.signedFilename,
    status: doc.status,
    createdAt: doc.createdAt,
    signedAt: doc.signedAt,
    expiresAt: doc.expiresAt,
    signaturePosition: doc.signaturePosition,
    signingLink: `${req.protocol}://${req.get('host')}/sign/${doc.token}`
  });
});

// Delete document
app.delete('/api/document/:documentId', requireAuth, (req, res) => {
  const doc = documents.get(req.params.documentId);
  
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    // Delete original file
    const originalPath = path.join('uploads', doc.filename);
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }

    // Delete signed file if exists
    if (doc.signedFilename) {
      const signedPath = path.join('signed', doc.signedFilename);
      if (fs.existsSync(signedPath)) {
        fs.unlinkSync(signedPath);
      }
    }

    // Remove from database
    documents.delete(req.params.documentId);
    saveDocuments(); // Save to file

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
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
