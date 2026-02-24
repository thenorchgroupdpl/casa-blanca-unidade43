/**
 * ImageUploader - Componente Global de Upload e Crop
 * 
 * Features:
 * - Dropzone com drag & drop
 * - Cropper com aspect ratio locking (1:1, 16:9, presets para logo)
 * - Preview contextual (Header para logo, Card para produto, Seção para backgrounds)
 * - Pipeline: crop no frontend → base64 → backend sharp (resize + webp) → S3
 * 
 * Usage contexts:
 * - "product" → 1:1 (800x800), preview = card de produto
 * - "logo"   → presets (3:1, 4:1, 1:1), preview = header do site
 * - "background" → 16:9, preview = seção com título
 * - "profile" → 1:1, preview = avatar circular
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Loader2,
  ImagePlus,
  Trash2,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export type ImageContext = "product" | "logo" | "background" | "profile";

export type ImageUploaderProps = {
  /** Current image URL (for edit mode) */
  value?: string | null;
  /** Called with the final processed image URL after upload */
  onChange: (url: string) => void;
  /** Called when image is removed */
  onRemove?: () => void;
  /** The context determines aspect ratio and preview style */
  context: ImageContext;
  /** Whether the upload is in progress (external control) */
  uploading?: boolean;
  /** Custom upload handler: receives base64 data (without prefix) and returns URL */
  onUpload: (base64Data: string, fileName: string) => Promise<string>;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the component */
  disabled?: boolean;
  /** Class name for the dropzone container */
  className?: string;
};

// ============================================
// ASPECT RATIO PRESETS
// ============================================

type AspectPreset = {
  label: string;
  value: number;
  description: string;
};

const ASPECT_PRESETS: Record<ImageContext, AspectPreset[]> = {
  product: [{ label: "1:1", value: 1, description: "Quadrado" }],
  profile: [{ label: "1:1", value: 1, description: "Quadrado" }],
  background: [{ label: "16:9", value: 16 / 9, description: "Widescreen" }],
  logo: [
    { label: "4:1", value: 4, description: "Horizontal largo" },
    { label: "3:1", value: 3, description: "Horizontal" },
    { label: "2:1", value: 2, description: "Horizontal curto" },
    { label: "1:1", value: 1, description: "Quadrado" },
  ],
};

// ============================================
// IMAGE COMPRESSION (client-side pre-processing)
// ============================================

const MAX_DIMENSION = 2000;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

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

        resolve(canvas.toDataURL("image/png"));
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
  aspectRatio: number,
  context: ImageContext = 'product'
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  // Output dimensions based on aspect ratio and context
  // Background/Hero images: 1920px max for Full HD quality
  // Other images: 1200px max for standard quality
  const maxSize = context === 'background' ? 1920 : 1200;
  let outW: number, outH: number;
  if (aspectRatio >= 1) {
    outW = Math.min(maxSize, Math.round(crop.width));
    outH = Math.round(outW / aspectRatio);
  } else {
    outH = Math.min(maxSize, Math.round(crop.height));
    outW = Math.round(outH * aspectRatio);
  }

  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, outW, outH);

  const scaleX = image.naturalWidth / (image.width * zoom);
  const scaleY = image.naturalHeight / (image.height * zoom);

  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outW, outH);

  return canvas;
}

// ============================================
// CONTEXTUAL PREVIEW COMPONENTS
// ============================================

function ProductPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-44 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-lg">
      <div className="aspect-square bg-zinc-700 relative overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black">
            DESTAQUE
          </span>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs font-semibold text-white truncate">Nome do Produto</p>
        <p className="text-[10px] text-zinc-500 truncate">Descrição breve do item</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-400">R$ 29,90</span>
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-black text-xs font-bold">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-full max-w-xs">
      <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Logo preview"
              className="h-10 w-auto object-contain max-w-[140px]"
              style={{ maxHeight: "40px" }}
            />
          ) : (
            <span className="text-sm font-display text-white">Sua Logo</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-[10px] text-zinc-500 hidden sm:block">Início</span>
          <span className="text-[10px] text-zinc-500 hidden sm:block">Cardápio</span>
          <span className="text-[10px] text-zinc-500 hidden sm:block">Sobre</span>
          <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40">
            <span className="text-[10px] text-amber-400 font-medium">WhatsApp</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-600 text-center mt-2">
        Simulação do Header — Logo limitada a max-height: 80-100px
      </p>
    </div>
  );
}

function BackgroundPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-full">
      {/* Simula tela de celular para mostrar como a imagem preencherá a seção */}
      <div className="relative mx-auto w-[180px] rounded-2xl overflow-hidden border-2 border-zinc-600 bg-zinc-900 shadow-xl">
        {/* Notch simulado */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-700 rounded-b-full z-10" />
        
        {/* Tela do celular - Hero section */}
        <div className="relative aspect-[9/16] overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Background preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-zinc-600" />
            </div>
          )}
          {/* Overlay com elementos simulados */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 flex flex-col">
            {/* Header simulado */}
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
              <div className="w-14 h-3 bg-white/30 rounded" />
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-white/20 rounded-full" />
                <div className="w-3 h-3 bg-white/20 rounded-full" />
              </div>
            </div>
            {/* Conteúdo central */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-16 h-2 bg-white/40 rounded mb-2" />
              <h3 className="text-white text-sm font-bold text-center">Nome da Loja</h3>
              <p className="text-zinc-300 text-[8px] mt-1 text-center">Subtítulo da loja</p>
              <div className="flex gap-2 mt-3">
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-[7px] text-white">Localização</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-[7px] text-white">Horários</span>
                </div>
              </div>
            </div>
            {/* CTA simulado */}
            <div className="px-4 pb-6">
              <div className="w-full py-2 rounded-full bg-amber-500/80 flex items-center justify-center">
                <span className="text-[8px] text-black font-bold">Fazer Pedido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 text-center mt-2">
        Simulação de como a imagem preencherá a tela (object-cover)
      </p>
    </div>
  );
}

function ProfilePreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-zinc-600" />
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-400">Nome do Usuário</p>
      <p className="text-[10px] text-zinc-600">Simulação de avatar</p>
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<ImageContext, React.FC<{ previewUrl: string | null }>> = {
  product: ProductPreview,
  logo: LogoPreview,
  background: BackgroundPreview,
  profile: ProfilePreview,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  context,
  uploading: externalUploading = false,
  onUpload,
  placeholder,
  disabled = false,
  className = "",
}: ImageUploaderProps) {
  // Dropzone state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("image.jpg");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Aspect ratio state (for logo presets)
  const presets = ASPECT_PRESETS[context];
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const currentAspect = presets[selectedPresetIdx]?.value ?? 1;

  // Reset crop when aspect ratio changes
  useEffect(() => {
    if (!imgRef.current || !cropperOpen) return;
    const { width, height } = imgRef.current;
    const aspect = currentAspect;

    let cropW: number, cropH: number;
    if (aspect >= 1) {
      cropW = Math.min(width, height * aspect) * 0.8;
      cropH = cropW / aspect;
    } else {
      cropH = Math.min(height, width / aspect) * 0.8;
      cropW = cropH * aspect;
    }

    // Ensure crop fits within image
    cropW = Math.min(cropW, width);
    cropH = Math.min(cropH, height);

    const x = (width - cropW) / 2;
    const y = (height - cropH) / 2;

    const newCrop: Crop = { unit: "px", x, y, width: cropW, height: cropH };
    setCrop(newCrop);
    setCompletedCrop(newCrop as PixelCrop);
  }, [selectedPresetIdx, currentAspect, cropperOpen]);

  // Generate preview whenever crop changes
  useEffect(() => {
    if (!imgRef.current || !completedCrop) return;

    const rafId = requestAnimationFrame(() => {
      try {
        const canvas = getCroppedCanvas(imgRef.current!, completedCrop, zoom, currentAspect, context);
        setPreviewUrl(canvas.toDataURL("image/png"));
      } catch {
        // Ignore preview errors
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [completedCrop, zoom, currentAspect]);

  // ---- File handling ----

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      return;
    }

    setOriginalFileName(file.name);
    setIsCompressing(true);
    setSelectedPresetIdx(0);
    setZoom(1);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);

    try {
      const dataUrl = await compressImage(file);
      setImageSrc(dataUrl);
      setCropperOpen(true);
    } catch {
      // Fallback: read directly
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile, disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  const handleDropzoneClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // ---- Cropper callbacks ----

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = currentAspect;

      let cropW: number, cropH: number;
      if (aspect >= 1) {
        cropW = Math.min(width, height * aspect) * 0.8;
        cropH = cropW / aspect;
      } else {
        cropH = Math.min(height, width / aspect) * 0.8;
        cropW = cropH * aspect;
      }

      cropW = Math.min(cropW, width);
      cropH = Math.min(cropH, height);

      const x = (width - cropW) / 2;
      const y = (height - cropH) / 2;

      const initialCrop: Crop = { unit: "px", x, y, width: cropW, height: cropH };
      setCrop(initialCrop);
      setCompletedCrop(initialCrop as PixelCrop);
    },
    [currentAspect]
  );

  const handleConfirmCrop = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);
    try {
      // For background/hero: export at higher quality (90% webp)
      const canvas = getCroppedCanvas(imgRef.current, completedCrop, zoom, currentAspect, context);
      const isHighRes = context === 'background';
      const base64Full = isHighRes
        ? canvas.toDataURL("image/webp", 0.92)
        : canvas.toDataURL("image/png");
      const base64Data = base64Full.split(",")[1];

      // Call the external upload handler
      const url = await onUpload(base64Data, originalFileName);
      onChange(url);
      setCropperOpen(false);
      setImageSrc(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, zoom, currentAspect, onUpload, onChange, originalFileName]);

  const handleCloseCropper = useCallback(() => {
    setCropperOpen(false);
    setImageSrc(null);
    setPreviewUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setZoom(1);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const aspect = currentAspect;
      let cropW = Math.min(width, height * aspect) * 0.8;
      let cropH = cropW / aspect;
      cropW = Math.min(cropW, width);
      cropH = Math.min(cropH, height);
      const x = (width - cropW) / 2;
      const y = (height - cropH) / 2;
      setCrop({ unit: "px", x, y, width: cropW, height: cropH });
    }
  }, [currentAspect]);

  const handleRemove = useCallback(() => {
    onRemove?.();
  }, [onRemove]);

  // ---- Preview component ----
  const PreviewComponent = PREVIEW_COMPONENTS[context];

  // ---- Placeholder text ----
  const placeholderText = placeholder || {
    product: "Arraste a foto do produto ou clique para selecionar",
    logo: "Arraste o logotipo ou clique para selecionar",
    background: "Arraste a imagem de fundo ou clique para selecionar",
    profile: "Arraste a foto de perfil ou clique para selecionar",
  }[context];

  const subtitleText = {
    product: "Será recortada em 1:1 e convertida para WebP",
    logo: "Escolha entre horizontal ou quadrado no editor",
    background: "Será recortada em 16:9 e convertida para WebP",
    profile: "Será recortada em 1:1 e convertida para WebP",
  }[context];

  const isUploading = externalUploading || isCompressing;

  return (
    <>
      {/* DROPZONE */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onClick={handleDropzoneClick}
        className={`relative border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 ${
          disabled
            ? "border-zinc-800 bg-zinc-900/30 cursor-not-allowed opacity-60"
            : isDragging
              ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
              : value
                ? "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                : "border-zinc-700 hover:border-amber-500/40 bg-zinc-800/30 hover:bg-zinc-800/50"
        } ${className}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs text-amber-400">Processando imagem...</p>
          </div>
        ) : value ? (
          <div className="relative p-3">
            <img
              src={value}
              alt="Imagem atual"
              className={`mx-auto object-contain rounded-lg ${
                context === "background" ? "max-h-32 w-full object-cover" : "max-h-40"
              }`}
            />
            <div className="absolute top-1 right-1 flex gap-1">
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-zinc-900/80 hover:bg-red-500/80 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Clique ou arraste para substituir</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <Upload className="w-8 h-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">{placeholderText}</p>
            <p className="text-[10px] text-zinc-600">{subtitleText}</p>
          </div>
        )}
      </div>

      {/* CROPPER MODAL */}
      <Dialog open={cropperOpen} onOpenChange={(v) => !v && handleCloseCropper()}>
        <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-700 p-0 gap-0 max-h-[95vh] overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="text-white text-lg">
              Editar Imagem
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              Ajuste o recorte e zoom. A imagem será convertida para WebP automaticamente.
            </DialogDescription>
          </DialogHeader>

          {/* Aspect Ratio Presets (only for logo) */}
          {presets.length > 1 && (
            <div className="px-5 pb-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
                Proporção do Corte
              </p>
              <div className="flex gap-2 flex-wrap">
                {presets.map((preset, idx) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedPresetIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedPresetIdx === idx
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    <span className="font-mono font-bold">{preset.label}</span>
                    <span className="text-zinc-500">·</span>
                    <span>{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 flex gap-5 min-h-0 overflow-hidden">
            {/* Left: Crop area */}
            <div className="flex-1 min-w-0">
              {isCompressing ? (
                <div className="flex flex-col items-center justify-center h-72 bg-zinc-800 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
                  <p className="text-sm text-zinc-400">Comprimindo imagem...</p>
                </div>
              ) : imageSrc ? (
                <div
                  className="relative bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ maxHeight: "360px" }}
                >
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={currentAspect}
                    className="max-h-[360px]"
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Editar"
                      onLoad={onImageLoad}
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center center",
                        maxHeight: "360px",
                        width: "auto",
                      }}
                      className="block"
                    />
                  </ReactCrop>
                </div>
              ) : null}
            </div>

            {/* Right: Contextual Preview */}
            <div className={`${context === 'background' ? 'w-56' : 'w-48'} shrink-0 flex flex-col items-center gap-3`}>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                Preview
              </span>
              <PreviewComponent previewUrl={previewUrl} />
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="px-5 py-3 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-12 shrink-0">Zoom</span>
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
              onClick={handleCloseCropper}
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isProcessing || !completedCrop}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isProcessing ? "Enviando..." : "Aplicar e Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
