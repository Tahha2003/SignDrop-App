import React, { useRef, useState, useEffect } from 'react';

function SignatureCanvas({ onSignatureChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onSignatureChange(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setUploadMode(false)}
          className={`px-4 py-2 rounded ${!uploadMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Draw
        </button>
        <button
          onClick={() => setUploadMode(true)}
          className={`px-4 py-2 rounded ${uploadMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Upload
        </button>
      </div>

      {!uploadMode ? (
        <div>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border-2 border-gray-300 rounded cursor-crosshair w-full touch-none"
          />
          <button
            onClick={clearCanvas}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        </div>
      ) : (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="signature-upload"
            />
            <label
              htmlFor="signature-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Click to upload signature image
            </label>
            <canvas ref={canvasRef} width={600} height={200} className="mt-4 border border-gray-200 rounded w-full" />
          </div>
          
          {uploadedFile && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-gray-500">{uploadedFile.type} • {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={clearUpload}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SignatureCanvas;
