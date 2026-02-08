import React, { useState, useRef, useEffect } from 'react';

function PDFUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 100, y: 100, page: 0 });
  const [boxSize, setBoxSize] = useState({ width: 200, height: 100 });
  const [signingLink, setSigningLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setSigningLink('');
    
    // Create URL for PDF preview
    const url = URL.createObjectURL(selectedFile);
    setPdfUrl(url);
    
    // Load PDF.js to get page count
    loadPDF(url);
  };

  const loadPDF = async (url) => {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument(url).promise;
    setPdfDoc(pdf);
    setPageCount(pdf.numPages);
    renderPage(pdf, 1);
  };

  const renderPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Clear any previous render tasks
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  };

  useEffect(() => {
    if (pdfUrl && pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [currentPage, pdfUrl, pdfDoc]);

  const handleMouseDown = (e) => {
    if (e.target.dataset.handle) {
      // Resizing
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setIsResizing(true);
      setResizeHandle(e.target.dataset.handle);
      setResizeStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: boxSize.width,
        height: boxSize.height,
        posX: position.x,
        posY: position.y
      });
      e.stopPropagation();
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on signature box
    const sigX = position.x;
    const sigY = canvas.height - position.y - boxSize.height;
    
    if (x >= sigX && x <= sigX + boxSize.width && y >= sigY && y <= sigY + boxSize.height) {
      setIsDragging(true);
      setDragOffset({ x: x - sigX, y: y - sigY });
    } else {
      // Place signature at click position
      const pdfY = canvas.height - y - boxSize.height;
      setPosition({ x: x, y: pdfY, page: currentPage - 1 });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isResizing) {
      const deltaX = mouseX - resizeStart.x;
      const deltaY = mouseY - resizeStart.y;
      
      let newWidth = boxSize.width;
      let newHeight = boxSize.height;
      let newX = position.x;
      let newY = position.y;

      switch (resizeHandle) {
        case 'se': // Bottom-right
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(30, resizeStart.height - deltaY);
          newY = resizeStart.posY + (resizeStart.height - newHeight);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(30, resizeStart.height - deltaY);
          newX = resizeStart.posX + (resizeStart.width - newWidth);
          newY = resizeStart.posY + (resizeStart.height - newHeight);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(30, resizeStart.height + deltaY);
          break;
        case 'nw': // Top-left
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(30, resizeStart.height + deltaY);
          newX = resizeStart.posX + (resizeStart.width - newWidth);
          break;
        case 'e': // Right
          newWidth = Math.max(50, resizeStart.width + deltaX);
          break;
        case 'w': // Left
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newX = resizeStart.posX + (resizeStart.width - newWidth);
          break;
        case 'n': // Top
          newHeight = Math.max(30, resizeStart.height + deltaY);
          break;
        case 's': // Bottom
          newHeight = Math.max(30, resizeStart.height - deltaY);
          newY = resizeStart.posY + (resizeStart.height - newHeight);
          break;
      }

      setBoxSize({ width: newWidth, height: newHeight });
      setPosition({ x: Math.max(0, newX), y: Math.max(0, newY), page: currentPage - 1 });
      return;
    }

    if (isDragging) {
      const x = mouseX - dragOffset.x;
      const y = mouseY - dragOffset.y;
      
      // Convert to PDF coordinates (bottom-left origin)
      const pdfY = canvas.height - y - boxSize.height;
      setPosition({ x: Math.max(0, x), y: Math.max(0, pdfY), page: currentPage - 1 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    
    // Get actual PDF page dimensions
    const page = await pdfDoc.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1 }); // Scale 1 = actual PDF dimensions
    const actualPageHeight = viewport.height;
    
    // Convert canvas coordinates to PDF coordinates
    const canvas = canvasRef.current;
    const canvasToActualRatio = viewport.height / canvas.height;
    
    const actualX = position.x * canvasToActualRatio;
    const actualY = position.y * canvasToActualRatio;
    const actualWidth = boxSize.width * canvasToActualRatio;
    const actualHeight = boxSize.height * canvasToActualRatio;
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('x', actualX);
    formData.append('y', actualY);
    formData.append('page', position.page);
    formData.append('width', actualWidth);
    formData.append('height', actualHeight);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Upload failed');
        return;
      }
      
      const data = await res.json();
      setSigningLink(data.signingLink);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(signingLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload PDF for Signature</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF Document
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {pdfUrl && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Place Signature Box</h3>
            <p className="text-sm text-gray-600 mb-3">
              Click or drag the red box to position where the signature should appear
            </p>
            
            {pageCount > 1 && (
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            <div 
              ref={containerRef}
              className="relative border-2 border-gray-300 rounded overflow-auto max-h-[600px] cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas ref={canvasRef} className="block" />
              
              {/* Signature box overlay */}
              {currentPage === position.page + 1 && (
                <div
                  className="absolute border-2 border-red-500 bg-red-100 bg-opacity-30 cursor-move"
                  style={{
                    left: `${position.x}px`,
                    top: `${canvasRef.current ? canvasRef.current.height - position.y - boxSize.height : 0}px`,
                    width: `${boxSize.width}px`,
                    height: `${boxSize.height}px`,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="flex items-center justify-center h-full text-red-700 text-sm font-medium">
                    Signature Here
                  </div>
                  
                  {/* Resize handles */}
                  <div 
                    data-handle="nw" 
                    className="absolute -top-1 -left-1 w-3 h-3 bg-red-600 border border-white cursor-nw-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="n" 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 border border-white cursor-n-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="ne" 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border border-white cursor-ne-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="e" 
                    className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-red-600 border border-white cursor-e-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="se" 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 border border-white cursor-se-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="s" 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 border border-white cursor-s-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="sw" 
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-600 border border-white cursor-sw-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div 
                    data-handle="w" 
                    className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-red-600 border border-white cursor-w-resize"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Generate Signing Link'}
        </button>

        {signingLink && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm font-medium text-green-800 mb-2">Signing Link Generated!</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={signingLink}
                readOnly
                className="flex-1 px-3 py-2 border border-green-300 rounded text-sm"
              />
              <button
                onClick={copyLink}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFUploader;
