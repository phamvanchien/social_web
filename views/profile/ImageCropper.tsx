"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

type ImageCropperProps = {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  cropSize?: number;
};

type Position = {
  x: number;
  y: number;
};

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  cropSize = 256,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load image and get dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);

      // Calculate initial zoom to fit image in crop area
      const minDimension = Math.min(img.width, img.height);
      const initialZoom = cropSize / minDimension;
      setZoom(Math.max(initialZoom, 1));
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc, cropSize]);

  // Generate cropped image whenever position or zoom changes
  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return;

    const generateCroppedImage = () => {
      const img = imageRef.current!;
      const canvas = document.createElement("canvas");
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Calculate the source coordinates
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;

      // Center of the crop area in the scaled image coordinate system
      const cropCenterX = scaledWidth / 2 - position.x;
      const cropCenterY = scaledHeight / 2 - position.y;

      // Source coordinates in the original image
      const srcX = (cropCenterX - cropSize / 2) / zoom;
      const srcY = (cropCenterY - cropSize / 2) / zoom;
      const srcSize = cropSize / zoom;

      // Create circular clip
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the image
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcSize,
        srcSize,
        0,
        0,
        cropSize,
        cropSize
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          }
        },
        "image/jpeg",
        0.9
      );
    };

    // Debounce the crop generation
    const timer = setTimeout(generateCroppedImage, 100);
    return () => clearTimeout(timer);
  }, [imageLoaded, position, zoom, cropSize, onCropComplete]);

  // Mouse/Touch handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Calculate bounds
    const img = imageRef.current;
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    const maxOffsetX = Math.max(0, (scaledWidth - cropSize) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - cropSize) / 2);

    setPosition({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
    });
  }, [isDragging, dragStart, zoom, cropSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  // Zoom handlers
  const handleZoomChange = (newZoom: number) => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const minZoom = cropSize / Math.min(img.width, img.height);
    const clampedZoom = Math.max(minZoom, Math.min(3, newZoom));

    // Adjust position to stay within bounds at new zoom level
    const scaledWidth = img.width * clampedZoom;
    const scaledHeight = img.height * clampedZoom;
    const maxOffsetX = Math.max(0, (scaledWidth - cropSize) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - cropSize) / 2);

    setPosition((prev) => ({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y)),
    }));

    setZoom(clampedZoom);
  };

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoomChange(zoom + delta);
  }, [zoom]);

  if (!imageLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const img = imageRef.current!;
  const minZoom = cropSize / Math.min(img.width, img.height);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Crop area */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-900 select-none"
        style={{ width: cropSize, height: cropSize }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Image */}
        <div
          className="absolute"
          style={{
            width: img.width * zoom,
            height: img.height * zoom,
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: "translate(-50%, -50%)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <img
            src={imageSrc}
            alt="Crop preview"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Circular overlay mask */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={cropSize}
          height={cropSize}
        >
          <defs>
            <mask id="circleMask">
              <rect width={cropSize} height={cropSize} fill="white" />
              <circle cx={cropSize / 2} cy={cropSize / 2} r={cropSize / 2} fill="black" />
            </mask>
          </defs>
          <rect
            width={cropSize}
            height={cropSize}
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#circleMask)"
          />
        </svg>

        {/* Circle border */}
        <div
          className="absolute border-2 border-white rounded-full pointer-events-none"
          style={{
            width: cropSize,
            height: cropSize,
            left: 0,
            top: 0,
          }}
        />

        {/* Drag hint */}
        {!isDragging && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
            <Move className="w-3 h-3" />
            <span>Kéo để di chuyển</span>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => handleZoomChange(zoom - 0.1)}
          disabled={zoom <= minZoom}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>

        <input
          type="range"
          min={minZoom}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <button
          type="button"
          onClick={() => handleZoomChange(zoom + 0.1)}
          disabled={zoom >= 3}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Sử dụng chuột hoặc ngón tay để di chuyển, cuộn để zoom
      </p>
    </div>
  );
}
