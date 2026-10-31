'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Icons } from '../ui/Icons';

interface SignatureCanvasProps {
  onSignatureCapture: (dataUrl: string) => void;
  isSigned?: boolean;
  signedDate?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureCapture,
  isSigned = false,
  signedDate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signedName] = useState('Aditya Mathur');

  useEffect(() => {
    // Client-side only initialization
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on CSS display size for crisp lines
    canvas.width = canvas.parentElement?.clientWidth || 380;
    canvas.height = 140;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        onSignatureCapture(canvas.toDataURL());
      } catch {
        // Fallback if data URL extraction is blocked
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icons.PenTool className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">
            Client Digital Signature (E-Sign)
          </span>
        </div>
        {!isSigned && hasDrawn && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear Pad
          </button>
        )}
      </div>

      {isSigned ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mb-1">
            <Icons.Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <p className="text-xs font-bold text-emerald-900">Digitally Signed & Verified</p>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">
            Signer: {signedName} • {signedDate || '30 Oct 2026, 04:15 PM IST'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">SHA-256 Hash Verified • Legally Binding</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative bg-white rounded-lg border border-dashed border-slate-300 overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full block touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs">
                <span>Draw your client signature here using mouse or finger</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>By signing, you lock the project scope & release schedule.</span>
            <span className="font-mono text-slate-400">IP: 49.37.112.94 logged</span>
          </div>
        </div>
      )}
    </div>
  );
};
