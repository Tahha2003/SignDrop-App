const { put } = require('@vercel/blob');
const { v4: uuidv4 } = require('uuid');
const formidable = require('formidable');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

// In-memory storage (use Vercel KV or database in production)
const documents = new Map();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB limit
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const pdfFile = files.pdf[0];
    const { x, y, page, width, height } = fields;

    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfFile.filepath);
    
    // Upload to Vercel Blob
    const documentId = uuidv4();
    const token = uuidv4();
    const filename = `${documentId}.pdf`;
    
    const blob = await put(filename, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    });

    // Get page dimensions
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pdfPage = pdfDoc.getPages()[parseInt(page[0])];
    const pageHeight = pdfPage.getHeight();

    // Store document metadata (use Vercel KV or database in production)
    const doc = {
      id: documentId,
      token,
      blobUrl: blob.url,
      originalName: pdfFile.originalFilename,
      signaturePosition: {
        x: parseFloat(x[0]),
        y: parseFloat(y[0]),
        page: parseInt(page[0]),
        width: parseFloat(width[0]),
        height: parseFloat(height[0]),
        pageHeight: pageHeight
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Store in environment variable or database
    // For now, using in-memory (will reset on each deploy)
    documents.set(documentId, doc);
    
    // Store in Vercel KV if available
    if (process.env.KV_REST_API_URL) {
      const { kv } = require('@vercel/kv');
      await kv.set(`doc:${documentId}`, JSON.stringify(doc));
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    
    res.json({
      documentId,
      signingLink: `${protocol}://${host}/sign/${token}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
}
