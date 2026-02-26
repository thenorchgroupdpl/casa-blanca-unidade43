/**
 * ImageUploader — Componente Global de Upload e Crop com Presets Dinâmicos
 *
 * Arquitetura de Presets:
 * - Cada chamada recebe um `preset` (ou `presetKey`) que define aspectRatio, maxOutputWidth,
 *   previewStyle, helperText, circularCrop e outputFormat.
 * - O modal de crop adapta-se dinamicamente ao preset: proporção travada, máscara visual
 *   (circular para perfil, retangular para banner), e preview contextual.
 * - Presets definidos em `@/lib/imagePresets.ts`.
 *
 * Contextos suportados (via previewStyle):
 * - 'banner'        → Hero / fundo de seção full-width
 * - 'circle-avatar' → Foto de perfil / proprietário (máscara circular)
 * - 'card'          → Card de produto
 * - 'header-logo'   → Logotipo no header
 * - 'section-bg'    → Fundo de seções genéricas
 * - 'location-cover' → Imagem de capa da localização
 */

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
import {
  IMAGE_PRESETS,
  type ImagePreset,
  type ImagePresetKey,
  type PreviewStyle,
  type AspectOption,
} from "@/lib/imagePresets";

// Re-export for backward compatibility
export type ImageContext = "product" | "logo" | "background" | "profile";

// ============================================
// TYPES
// ============================================

export type ImageUploaderProps = {
  /** Current image URL (for edit mode) */
  value?: string | null;
  /** Called with the final processed image URL after upload */
  onChange: (url: string) => void;
  /** Called when image is removed */
  onRemove?: () => void;
  /** The preset key determines aspect ratio, preview style, and output settings */
  presetKey?: ImagePresetKey;
  /** Direct preset object (overrides presetKey) */
  preset?: ImagePreset;
  /** Legacy: context prop for backward compatibility */
  context?: ImageContext;
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
// LEGACY CONTEXT → PRESET MAPPING
// ============================================

const CONTEXT_TO_PRESET: Record<ImageContext, ImagePresetKey> = {
  product: 'PRODUCT_CARD',
  logo: 'LOGO',
  background: 'HERO_BANNER',
  profile: 'PROFILE_PHOTO',
};

function resolvePreset(props: Pick<ImageUploaderProps, 'preset' | 'presetKey' | 'context'>): ImagePreset {
  if (props.preset) return props.preset;
  if (props.presetKey) return IMAGE_PRESETS[props.presetKey];
  if (props.context) return IMAGE_PRESETS[CONTEXT_TO_PRESET[props.context]];
  return IMAGE_PRESETS.HERO_BANNER;
}

// ============================================
// IMAGE COMPRESSION (client-side pre-processing)
// ============================================

/**
 * Pre-processes an image file before cropping.
 * - preserveOriginalSize=true: loads the image at full resolution (no downscale)
 * - preserveOriginalSize=false: downscales to maxDimension to keep the cropper snappy
 */
async function compressImage(file: File, maxDimension: number, preserveOriginal: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // If preserving original size, return the raw dataURL without any canvas processing
      if (preserveOriginal) {
        resolve(reader.result as string);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
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
  preset: ImagePreset
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  // Calculate source dimensions (the actual pixels being cropped from the original image)
  const scaleX = image.naturalWidth / (image.width * zoom);
  const scaleY = image.naturalHeight / (image.height * zoom);
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  let outW: number, outH: number;

  if (preset.preserveOriginalSize) {
    // Qualidade máxima: usa as dimensões reais do crop na imagem original
    outW = Math.round(sourceWidth);
    outH = Math.round(sourceHeight);
  } else {
    // Performance: redimensiona para maxOutputWidth
    const maxSize = preset.maxOutputWidth;
    if (aspectRatio >= 1) {
      outW = Math.min(maxSize, Math.round(sourceWidth));
      outH = Math.round(outW / aspectRatio);
    } else {
      outH = Math.min(maxSize, Math.round(sourceHeight));
      outW = Math.round(outH * aspectRatio);
    }
  }

  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, outW, outH);

  // Apply circular clipping for avatar presets
  if (preset.circularCrop) {
    ctx.beginPath();
    ctx.ellipse(outW / 2, outH / 2, outW / 2, outH / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outW, outH);

  return canvas;
}

// ============================================
// CONTEXTUAL PREVIEW COMPONENTS
// ============================================

function BannerPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-full">
      <div className="relative mx-auto w-[180px] rounded-2xl overflow-hidden border-2 border-zinc-600 bg-zinc-900 shadow-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-700 rounded-b-full z-10" />
        <div className="relative aspect-[9/16] overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Background preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 flex flex-col">
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
              <div className="w-14 h-3 bg-white/30 rounded" />
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-white/20 rounded-full" />
                <div className="w-3 h-3 bg-white/20 rounded-full" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-16 h-2 bg-white/40 rounded mb-2" />
              <h3 className="text-white text-sm font-bold text-center">Nome da Loja</h3>
              <p className="text-zinc-300 text-[8px] mt-1 text-center">Subtítulo da loja</p>
            </div>
            <div className="px-4 pb-6">
              <div className="w-full py-2 rounded-full bg-amber-500/80 flex items-center justify-center">
                <span className="text-[8px] text-black font-bold">Fazer Pedido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 text-center mt-2">
        Simulação do Hero (object-cover)
      </p>
    </div>
  );
}

function CircleAvatarPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-amber-500/40 bg-zinc-800 shadow-lg shadow-amber-500/10">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs text-zinc-300 font-medium">Nome do Proprietário</p>
        <p className="text-[10px] text-zinc-500">Fundador & Chef</p>
      </div>
      <p className="text-[10px] text-zinc-600 text-center">
        Preview circular — Seção "Sobre Nós"
      </p>
    </div>
  );
}

function SquareProfilePreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-amber-500/40 bg-zinc-800 shadow-lg shadow-amber-500/10">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs text-zinc-300 font-medium">Nome do Proprietário</p>
        <p className="text-[10px] text-zinc-500">Fundador & Chef</p>
      </div>
      <p className="text-[10px] text-zinc-600 text-center">
        Preview quadrado — Seção "Sobre Nós"
      </p>
    </div>
  );
}

function CardPreview({ previewUrl }: { previewUrl: string | null }) {
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

function HeaderLogoPreview({ previewUrl }: { previewUrl: string | null }) {
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

function SectionBgPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-video bg-zinc-800">
        {previewUrl ? (
          <img src={previewUrl} alt="Section bg preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-2 bg-white/40 rounded mx-auto mb-2" />
            <div className="w-32 h-1.5 bg-white/20 rounded mx-auto" />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 text-center mt-2">
        Preview da seção com overlay
      </p>
    </div>
  );
}

function LocationCoverPreview({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-video bg-zinc-800">
        {previewUrl ? (
          <img src={previewUrl} alt="Location preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500/60" />
            <div>
              <div className="w-20 h-1.5 bg-white/50 rounded mb-1" />
              <div className="w-28 h-1 bg-white/30 rounded" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 text-center mt-2">
        Preview — Fachada / Local
      </p>
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<PreviewStyle, React.FC<{ previewUrl: string | null }>> = {
  'banner': BannerPreview,
  'circle-avatar': CircleAvatarPreview,
  'square-profile': SquareProfilePreview,
  'card': CardPreview,
  'header-logo': HeaderLogoPreview,
  'section-bg': SectionBgPreview,
  'location-cover': LocationCoverPreview,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  presetKey,
  preset: presetProp,
  context,
  uploading: externalUploading = false,
  onUpload,
  placeholder,
  disabled = false,
  className = "",
}: ImageUploaderProps) {
  // Resolve the active preset
  const activePreset = resolvePreset({ preset: presetProp, presetKey, context });

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

  // Aspect ratio state (for presets with multiple options)
  const aspectPresets = activePreset.aspectPresets;
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const currentAspect = aspectPresets[selectedPresetIdx]?.value ?? activePreset.aspectRatio;

  // Reset preset index when preset changes
  useEffect(() => {
    setSelectedPresetIdx(0);
  }, [activePreset]);

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
        const canvas = getCroppedCanvas(imgRef.current!, completedCrop, zoom, currentAspect, activePreset);
        setPreviewUrl(canvas.toDataURL("image/png"));
      } catch {
        // Ignore preview errors
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [completedCrop, zoom, currentAspect, activePreset]);

  // ---- File handling ----

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) return;

    setOriginalFileName(file.name);
    setIsCompressing(true);
    setSelectedPresetIdx(0);
    setZoom(1);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);

    try {
      const maxDim = activePreset.preserveOriginalSize ? Infinity : (activePreset.maxOutputWidth > 1200 ? 2500 : 2000);
      const dataUrl = await compressImage(file, maxDim, activePreset.preserveOriginalSize);
      setImageSrc(dataUrl);
      setCropperOpen(true);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  }, [activePreset]);

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
      const canvas = getCroppedCanvas(imgRef.current, completedCrop, zoom, currentAspect, activePreset);
      
      // Quality-aware export:
      // - preserveOriginalSize presets: quality=1.0, no lossy compression
      // - Performance presets: use configured quality for smaller file sizes
      const isWebp = activePreset.outputFormat === 'webp';
      const exportQuality = activePreset.preserveOriginalSize ? 1.0 : activePreset.quality;
      const base64Full = isWebp
        ? canvas.toDataURL("image/webp", exportQuality)
        : canvas.toDataURL("image/png"); // PNG is lossless, quality param ignored
      const base64Data = base64Full.split(",")[1];

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
  }, [completedCrop, zoom, currentAspect, activePreset, onUpload, onChange, originalFileName]);

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
      let cropW = aspect >= 1
        ? Math.min(width, height * aspect) * 0.8
        : Math.min(height, width / aspect) * 0.8 * aspect;
      let cropH = aspect >= 1 ? cropW / aspect : cropW / aspect;
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
  const PreviewComponent = PREVIEW_COMPONENTS[activePreset.previewStyle] || SectionBgPreview;

  // ---- Placeholder text ----
  const placeholderText = placeholder || activePreset.helperText;

  const isUploading = externalUploading || isCompressing;

  // ---- Determine preview column width based on style ----
  const previewWidth = activePreset.previewStyle === 'banner' || activePreset.previewStyle === 'section-bg' || activePreset.previewStyle === 'location-cover'
    ? 'w-56'
    : activePreset.previewStyle === 'header-logo'
      ? 'w-56'
      : 'w-48';

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
                activePreset.previewStyle === 'banner' || activePreset.previewStyle === 'section-bg' || activePreset.previewStyle === 'location-cover'
                  ? "max-h-32 w-full object-cover"
                  : activePreset.previewStyle === 'circle-avatar'
                    ? "max-h-32 rounded-full"
                    : "max-h-40"
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
            <p className="text-[10px] text-zinc-600">
              {activePreset.outputFormat === 'webp' ? 'Será convertida para WebP' : 'Será exportada como PNG'}
              {' · '}Max {activePreset.maxOutputWidth}px
            </p>
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
              {activePreset.helperText}
            </DialogDescription>
          </DialogHeader>

          {/* Aspect Ratio Presets (only when multiple options) */}
          {aspectPresets.length > 1 && (
            <div className="px-5 pb-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
                Proporção do Corte
              </p>
              <div className="flex gap-2 flex-wrap">
                {aspectPresets.map((ap: AspectOption, idx: number) => (
                  <button
                    key={ap.label}
                    onClick={() => setSelectedPresetIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedPresetIdx === idx
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    <span className="font-mono font-bold">{ap.label}</span>
                    <span className="text-zinc-500">·</span>
                    <span>{ap.description}</span>
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
                    circularCrop={activePreset.circularCrop}
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
            <div className={`${previewWidth} shrink-0 flex flex-col items-center gap-3`}>
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
