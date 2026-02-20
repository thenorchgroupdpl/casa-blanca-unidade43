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
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Loader2 } from "lucide-react";

// ============================================
// IMAGE COMPRESSION
// ============================================

const MAX_DIMENSION = 1200;
const QUALITY = 0.82;

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

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          QUALITY
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
  zoom: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const outputSize = Math.min(crop.width, crop.height, 800);
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // The image is displayed at a zoomed scale, so we need to calculate
  // the actual source coordinates from the displayed crop
  const scaleX = image.naturalWidth / (image.width * zoom);
  const scaleY = image.naturalHeight / (image.height * zoom);

  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compress and load image when file changes
  useEffect(() => {
    if (!file || !open) return;

    setIsCompressing(true);
    setZoom(1);
    setCrop(undefined);
    setCompletedCrop(undefined);

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

  // Handle crop completion
  const handleComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);
    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop, zoom);
      const base64 = canvas.toDataURL("image/jpeg", QUALITY);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas to blob failed"))),
          "image/jpeg",
          QUALITY
        );
      });

      onComplete(base64, blob);
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, zoom, onComplete]);

  const handleReset = () => {
    setZoom(1);
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-white text-lg">Editar Imagem</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Ajuste o zoom e selecione a área da imagem que deseja usar.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5">
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center h-80 bg-zinc-800 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
              <p className="text-sm text-zinc-400">Comprimindo imagem...</p>
            </div>
          ) : imageSrc ? (
            <div className="relative bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ maxHeight: "420px" }}
            >
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={false}
                className="max-h-[420px]"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Editar"
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                    maxHeight: "420px",
                    width: "auto",
                  }}
                  className="block"
                />
              </ReactCrop>
            </div>
          ) : null}
        </div>

        {/* Zoom Controls */}
        <div className="px-5 py-3 space-y-2">
          <div className="flex items-center gap-3">
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
