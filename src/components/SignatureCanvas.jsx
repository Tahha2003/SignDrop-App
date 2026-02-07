import React, { useRef, useState, useEffect } from 'react';

function SignatureCanvas({ onSignatureChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
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
            className="border-2 border-gray-300 rounded cursor-crosshair w-full"
            style={{ touchAction: 'none' }}
          />
          <button
            onClick={clearCanvas}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        </div>
      ) : (
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
          <canvas ref={canvasRef} width={600} height={200} className="hidden" />
        </div>
      )}
    </div>
  );
}

export default SignatureCanvas;
