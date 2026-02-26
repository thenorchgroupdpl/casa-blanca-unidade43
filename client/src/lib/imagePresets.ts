/**
 * IMAGE_PRESETS — Configurações centralizadas para cada tipo de imagem do sistema.
 *
 * Cada preset define:
 *  - aspectRatio: proporção de corte obrigatória (largura / altura)
 *  - aspectPresets: lista de proporções alternativas (ex: logo pode ser 4:1, 3:1, 1:1)
 *  - maxOutputWidth: largura máxima do output em pixels
 *  - quality: qualidade de compressão (0-1)
 *  - previewStyle: estilo visual do preview no modal ('banner' | 'circle-avatar' | 'card' | 'header-logo' | 'section-bg')
 *  - helperText: texto de ajuda exibido ao usuário
 *  - circularCrop: se true, mostra máscara circular no crop (para avatares)
 *  - outputFormat: formato de saída preferido ('png' | 'webp')
 */

export type PreviewStyle = 'banner' | 'circle-avatar' | 'square-profile' | 'card' | 'header-logo' | 'section-bg' | 'location-cover';

export type AspectOption = {
  label: string;
  value: number;
  description: string;
};

export type ImagePreset = {
  /** Proporção de corte padrão (largura / altura). Ignorado se aspectPresets tiver mais de 1 opção. */
  aspectRatio: number;
  /** Lista de proporções disponíveis. Se length > 1, mostra seletor no modal. */
  aspectPresets: AspectOption[];
  /** Largura máxima do output em pixels */
  maxOutputWidth: number;
  /** Qualidade de compressão (0-1) */
  quality: number;
  /** Estilo visual do preview contextual no modal */
  previewStyle: PreviewStyle;
  /** Texto de ajuda para o usuário */
  helperText: string;
  /** Se true, aplica máscara circular no crop */
  circularCrop: boolean;
  /** Formato de saída preferido */
  outputFormat: 'png' | 'webp';
};

export const IMAGE_PRESETS = {
  /**
   * HERO_BANNER — Imagem de fundo do Hero (seção 1.7)
   * Proporção 16:9, alta resolução para cobrir tela inteira.
   */
  HERO_BANNER: {
    aspectRatio: 16 / 9,
    aspectPresets: [
      { label: '16:9', value: 16 / 9, description: 'Widescreen' },
      { label: '4:3', value: 4 / 3, description: 'Clássico' },
      { label: '21:9', value: 21 / 9, description: 'Ultra-wide' },
    ],
    maxOutputWidth: 1920,
    quality: 0.92,
    previewStyle: 'banner' as PreviewStyle,
    helperText: 'Recomendado: 1920×1080px (Horizontal, alta resolução)',
    circularCrop: false,
    outputFormat: 'webp' as const,
  },

  /**
   * PROFILE_PHOTO — Foto do proprietário / avatar (seção 2.3 Sobre Nós)
   * Proporção 1:1 obrigatória, preview quadrado com cantos retos.
   */
  PROFILE_PHOTO: {
    aspectRatio: 1,
    aspectPresets: [
      { label: '1:1', value: 1, description: 'Quadrado' },
    ],
    maxOutputWidth: 800,
    quality: 0.85,
    previewStyle: 'square-profile' as PreviewStyle,
    helperText: 'Recomendado: Imagem quadrada (ex: 800×800px)',
    circularCrop: false,
    outputFormat: 'png' as const,
  },

  /**
   * LOGO — Logotipo da empresa (seção 1.1 Header)
   * Múltiplas proporções disponíveis (horizontal largo, horizontal, quadrado).
   */
  LOGO: {
    aspectRatio: 4,
    aspectPresets: [
      { label: '4:1', value: 4, description: 'Horizontal largo' },
      { label: '3:1', value: 3, description: 'Horizontal' },
      { label: '2:1', value: 2, description: 'Horizontal curto' },
      { label: '1:1', value: 1, description: 'Quadrado' },
    ],
    maxOutputWidth: 800,
    quality: 0.9,
    previewStyle: 'header-logo' as PreviewStyle,
    helperText: 'Recomendado: Logo horizontal (ex: 400×100px) ou quadrada',
    circularCrop: false,
    outputFormat: 'png' as const,
  },

  /**
   * SECTION_BG — Imagem de fundo de seções genéricas (2.4, 2.7, 5.5, 6.7)
   * Proporção 16:9, resolução média-alta.
   */
  SECTION_BG: {
    aspectRatio: 16 / 9,
    aspectPresets: [
      { label: '16:9', value: 16 / 9, description: 'Widescreen' },
      { label: '4:3', value: 4 / 3, description: 'Clássico' },
    ],
    maxOutputWidth: 1600,
    quality: 0.88,
    previewStyle: 'section-bg' as PreviewStyle,
    helperText: 'Recomendado: 1600×900px (Horizontal)',
    circularCrop: false,
    outputFormat: 'webp' as const,
  },

  /**
   * LOCATION_COVER — Imagem de capa da localização (seção 6.2)
   * Proporção 16:9, foco em fachadas e fotos do local.
   */
  LOCATION_COVER: {
    aspectRatio: 16 / 9,
    aspectPresets: [
      { label: '16:9', value: 16 / 9, description: 'Widescreen' },
      { label: '3:2', value: 3 / 2, description: 'Foto padrão' },
    ],
    maxOutputWidth: 1200,
    quality: 0.88,
    previewStyle: 'location-cover' as PreviewStyle,
    helperText: 'Recomendado: Foto da fachada ou local (1200×675px)',
    circularCrop: false,
    outputFormat: 'webp' as const,
  },

  /**
   * PRODUCT_CARD — Imagem de produto (catálogo do lojista)
   * Proporção 1:1, tamanho médio.
   */
  PRODUCT_CARD: {
    aspectRatio: 1,
    aspectPresets: [
      { label: '1:1', value: 1, description: 'Quadrado' },
      { label: '4:5', value: 4 / 5, description: 'Retrato' },
    ],
    maxOutputWidth: 1000,
    quality: 0.85,
    previewStyle: 'card' as PreviewStyle,
    helperText: 'Recomendado: Imagem quadrada (ex: 800×800px)',
    circularCrop: false,
    outputFormat: 'webp' as const,
  },
} as const satisfies Record<string, ImagePreset>;

export type ImagePresetKey = keyof typeof IMAGE_PRESETS;

/**
 * Helper para obter um preset por chave.
 */
export function getImagePreset(key: ImagePresetKey): ImagePreset {
  return IMAGE_PRESETS[key];
}
