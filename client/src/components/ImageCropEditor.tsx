import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Loader2, Square, RectangleHorizontal, Circle } from "lucide-react";

// ============================================
// IMAGE COMPRESSION
// ============================================

const MAX_DIMENSION = 1200;
const QUALITY = 0.85;

async function compressImage(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down if larger than max dimension
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Use PNG to preserve quality for logos
        const dataUrl = canvas.toDataURL("image/png");
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            resolve({ blob, dataUrl });
          },
          "image/png"
        );
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================
// CROP TO CANVAS
// ============================================

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop,
  zoom: number,
  borderRadius: number = 0
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const outputSize = Math.min(crop.width, crop.height, 800);
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Clear canvas with transparency
  ctx.clearRect(0, 0, outputSize, outputSize);

  // The image is displayed at a zoomed scale, so we need to calculate
  // the actual source coordinates from the displayed crop
  const scaleX = image.naturalWidth / (image.width * zoom);
  const scaleY = image.naturalHeight / (image.height * zoom);

  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  // Apply border-radius clipping if needed
  if (borderRadius > 0) {
    const radiusPixels = (borderRadius / 100) * (outputSize / 2);
    ctx.beginPath();
    ctx.moveTo(radiusPixels, 0);
    ctx.arcTo(outputSize, 0, outputSize, outputSize, radiusPixels);
    ctx.arcTo(outputSize, outputSize, 0, outputSize, radiusPixels);
    ctx.arcTo(0, outputSize, 0, 0, radiusPixels);
    ctx.arcTo(0, 0, outputSize, 0, radiusPixels);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas;
}

// ============================================
// MAIN COMPONENT
// ============================================

type ImageCropEditorProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (croppedBase64: string, blob: Blob) => void;
  file: File | null;
  aspectRatio?: number;
};

export default function ImageCropEditor({
  open,
  onClose,
  onComplete,
  file,
  aspectRatio = 1,
}: ImageCropEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [borderRadius, setBorderRadius] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compress and load image when file changes
  useEffect(() => {
    if (!file || !open) return;

    setIsCompressing(true);
    setZoom(1);
    setBorderRadius(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);

    compressImage(file)
      .then(({ dataUrl }) => {
        setImageSrc(dataUrl);
        setIsCompressing(false);
      })
      .catch((err) => {
        console.error("Compression error:", err);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(file);
      });
  }, [file, open]);

  // Generate preview whenever crop, zoom or borderRadius changes
  useEffect(() => {
    if (!imgRef.current || !completedCrop) return;

    // Use requestAnimationFrame for smooth preview
    const rafId = requestAnimationFrame(() => {
      try {
        const canvas = getCroppedCanvas(imgRef.current!, completedCrop, zoom, borderRadius);
        const url = canvas.toDataURL("image/png");
        setPreviewUrl(url);
      } catch {
        // Ignore preview errors
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [completedCrop, zoom, borderRadius]);

  // Set initial crop when image loads
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const cropSize = Math.min(width, height) * 0.8;
      const x = (width - cropSize) / 2;
      const y = (height - cropSize) / 2;

      const initialCrop: Crop = {
        unit: "px",
        x,
        y,
        width: cropSize,
        height: cropSize,
      };
      setCrop(initialCrop);
      setCompletedCrop(initialCrop as PixelCrop);
    },
    []
  );

  // Handle crop completion - export as PNG for transparency
  const handleComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);
    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop, zoom, borderRadius);
      const base64 = canvas.toDataURL("image/png");

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas to blob failed"))),
          "image/png"
        );
      });

      onComplete(base64, blob);
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, zoom, borderRadius, onComplete]);

  const handleReset = () => {
    setZoom(1);
    setBorderRadius(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const cropSize = Math.min(width, height) * 0.8;
      const x = (width - cropSize) / 2;
      const y = (height - cropSize) / 2;
      setCrop({ unit: "px", x, y, width: cropSize, height: cropSize });
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setZoom(1);
    setBorderRadius(0);
    setPreviewUrl(null);
    onClose();
  };

  // Preset buttons for quick border-radius selection
  const presets = [
    { label: "Quadrado", value: 0, icon: Square },
    { label: "Arredondado", value: 20, icon: RectangleHorizontal },
    { label: "Circular", value: 50, icon: Circle },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-white text-lg">Editar Imagem</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Ajuste o zoom, recorte e arredondamento da imagem.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 flex gap-4">
          {/* Left: Crop area */}
          <div className="flex-1 min-w-0">
            {isCompressing ? (
              <div className="flex flex-col items-center justify-center h-80 bg-zinc-800 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm text-zinc-400">Comprimindo imagem...</p>
              </div>
            ) : imageSrc ? (
              <div className="relative bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ maxHeight: "380px" }}
              >
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop={false}
                  className="max-h-[380px]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Editar"
                    onLoad={onImageLoad}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      maxHeight: "380px",
                      width: "auto",
                    }}
                    className="block"
                  />
                </ReactCrop>
              </div>
            ) : null}
          </div>

          {/* Right: Live preview */}
          {previewUrl && (
            <div className="w-40 shrink-0 flex flex-col items-center gap-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Preview</span>
              <div
                className="w-32 h-32 bg-zinc-800 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #333 25%, transparent 25%),
                    linear-gradient(-45deg, #333 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #333 75%),
                    linear-gradient(-45deg, transparent 75%, #333 75%)
                  `,
                  backgroundSize: "12px 12px",
                  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-zinc-600 text-center">
                {borderRadius === 0 ? "Quadrado" : borderRadius >= 50 ? "Circular" : `Arredondado ${borderRadius}%`}
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-3 space-y-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-16 shrink-0">Zoom</span>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={0.5}
              max={3}
              step={0.05}
              className="flex-1"
            />
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs text-zinc-500 font-mono w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Border Radius Control */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-16 shrink-0">Bordas</span>
              <Slider
                value={[borderRadius]}
                onValueChange={([v]) => setBorderRadius(v)}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-zinc-500 font-mono w-12 text-right">
                {borderRadius}%
              </span>
            </div>
            {/* Preset buttons */}
            <div className="flex gap-2 justify-center">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setBorderRadius(p.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                    borderRadius === p.value
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border border-zinc-700"
                  }`}
                >
                  <p.icon className="h-3.5 w-3.5" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Resetar
            </button>
          </div>
        </div>

        <DialogFooter className="px-5 pb-5 pt-2 border-t border-zinc-800 flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isProcessing || !completedCrop}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            {isProcessing ? "Processando..." : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
