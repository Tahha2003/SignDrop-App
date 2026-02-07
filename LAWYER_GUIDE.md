# SignDrop - User Guide for Lawyers

## What is SignDrop?

SignDrop is a secure digital signature collection tool that allows you to:
- Upload PDF documents
- Specify where signatures should be placed
- Generate secure links for clients to sign
- Download signed PDFs

## Getting Started

### Accessing SignDrop

Your SignDrop instance is available at: `[YOUR_DEPLOYMENT_URL]`

Example: `https://signdrop.yourdomain.com`

### How to Collect a Signature

#### Step 1: Upload Your PDF
1. Click "Upload New PDF" button
2. Select the PDF document that needs signing
3. Wait for the document to load

#### Step 2: Position the Signature Box
- A red box labeled "Signature Here" will appear on your PDF
- **Move it:** Click and drag the box to where the signature should go
- **Resize it:** Drag the small red squares on the edges/corners
  - Corner handles: Resize diagonally
  - Edge handles: Resize in one direction
- **Multiple pages:** Use Previous/Next buttons to navigate

#### Step 3: Generate Signing Link
1. Once positioned correctly, click "Generate Signing Link"
2. A secure link will appear (valid for 7 days)
3. Click "Copy" to copy the link

#### Step 4: Send to Client
- Email the link to your client
- Client can open it on any device (phone, tablet, computer)
- No login or account required for client

#### Step 5: Download Signed PDF
1. Client signs the document
2. Return to your dashboard
3. Click "Refresh" to see updated status
4. When status shows "signed", click "Download"

## Security Features

✅ **Secure Links:** Each link is unique and expires after 7 days
✅ **One-Time Use:** Links cannot be used after signing
✅ **Rate Limited:** Protection against abuse
✅ **HTTPS Encrypted:** All data transmitted securely
✅ **No Third Parties:** Your documents stay on your server

## Client Experience

Your client will:
1. Click the link you sent
2. See the document name
3. Draw their signature OR upload a signature image
4. Click "Sign Document"
5. Done! They'll see a confirmation

**No account needed. No software to install.**

## Best Practices

### Document Preparation
- Ensure PDF is finalized before uploading
- Mark signature areas clearly in the document
- Test the signing process yourself first

### Link Sharing
- Send links via secure email
- Verify recipient email address
- Don't share links publicly
- Links expire in 7 days - plan accordingly

### Storage
- Download signed PDFs promptly
- Store in your document management system
- Keep backups of important documents

## Troubleshooting

### "Link expired" error
- Links are valid for 7 days only
- Upload the document again to generate a new link

### Signature appears in wrong position
- Make sure you're viewing the correct page
- Test by signing yourself before sending to client
- Adjust position and regenerate link if needed

### Client can't open link
- Verify link was copied completely
- Check if link has expired
- Ensure client has internet connection

### Document not showing as signed
- Click "Refresh" button on dashboard
- Wait a few seconds and try again
- Check if client completed the signing process

## Support

For technical issues or questions:
- Check DEPLOYMENT.md for server management
- Review server logs: `pm2 logs signdrop`
- Contact your IT administrator

## Legal Considerations

⚠️ **Important:** 
- Verify digital signatures are legally binding in your jurisdiction
- Keep records of when documents were signed
- Maintain audit trails as required by law
- Consult with legal counsel about e-signature compliance

## Privacy & Data

- Documents are stored on your server only
- No third-party services have access
- Client signatures are embedded directly into PDFs
- Regular backups recommended (see DEPLOYMENT.md)
