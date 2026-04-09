/**
 * Google Reviews Service
 *
 * Busca avaliações reais da Google Places API com cache in-memory de 1 hora.
 * Nunca retorna mock data — se não houver credenciais ou a API falhar,
 * retorna status explícito para que o admin possa diagnosticar o problema.
 */

export interface GoogleReview {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  isFromGoogle: boolean;
}

export type GoogleReviewsStatus = 'ok' | 'error' | 'unconfigured';

export interface GoogleReviewsResult {
  reviews: GoogleReview[];
  status: GoogleReviewsStatus;
  /** Mensagem de erro da API (ex: REQUEST_DENIED, INVALID_REQUEST) */
  error?: string;
  /** Quando o cache foi preenchido */
  cachedAt?: Date;
}

// Cache in-memory: chave = "placeId:apiKey" → { resultado, expira em }
const reviewCache = new Map<string, { result: GoogleReviewsResult; expiresAt: number }>();

const CACHE_TTL_MS = 60 * 60 * 1000;        // 1 hora para resultados OK
const CACHE_ERROR_TTL_MS = 5 * 60 * 1000;   // 5 min para erros (evita hammering)

/**
 * Busca avaliações do Google Places para um dado placeId.
 *
 * @param placeId - Google Place ID (ex: "ChIJ...")
 * @param googleApiKey - Chave de API do Google com Places API habilitada
 */
export async function getGoogleReviews(
  placeId: string | null | undefined,
  googleApiKey: string | null | undefined,
): Promise<GoogleReviewsResult> {
  // Sem credenciais configuradas — não há o que fazer
  if (!placeId || !googleApiKey) {
    return { reviews: [], status: 'unconfigured' };
  }

  const cacheKey = `${placeId}::${googleApiKey.slice(-8)}`; // não logar chave completa
  const cached = reviewCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[GoogleReviews] Cache hit para place ${placeId} (expira em ${Math.round((cached.expiresAt - Date.now()) / 60000)} min)`);
    return cached.result;
  }

  console.log(`[GoogleReviews] Buscando avaliações reais para place ${placeId}`);

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'reviews,rating,user_ratings_total');
    url.searchParams.set('key', googleApiKey);
    url.searchParams.set('language', 'pt-BR');

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      const errorMsg = [data.status, data.error_message].filter(Boolean).join(' — ');
      console.error(`[GoogleReviews] API retornou erro: ${errorMsg}`);

      const result: GoogleReviewsResult = {
        reviews: [],
        status: 'error',
        error: errorMsg,
      };
      reviewCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_ERROR_TTL_MS });
      return result;
    }

    const rawReviews: any[] = data.result?.reviews ?? [];

    const reviews: GoogleReview[] = rawReviews.map((r) => ({
      authorName: r.author_name ?? 'Anônimo',
      authorPhoto: r.profile_photo_url ?? '',
      rating: r.rating ?? 5,
      text: r.text ?? '',
      relativeTime: r.relative_time_description ?? '',
      isFromGoogle: true,
    }));

    console.log(`[GoogleReviews] ${reviews.length} avaliações obtidas para place ${placeId}`);

    const result: GoogleReviewsResult = {
      reviews,
      status: 'ok',
      cachedAt: new Date(),
    };
    reviewCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;

  } catch (err: any) {
    const errorMsg = `Erro de rede: ${err.message}`;
    console.error(`[GoogleReviews] ${errorMsg}`);

    const result: GoogleReviewsResult = {
      reviews: [],
      status: 'error',
      error: errorMsg,
    };
    reviewCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_ERROR_TTL_MS });
    return result;
  }
}

/** Invalida o cache para um tenant específico (útil ao salvar nova API key) */
export function invalidateGoogleReviewsCache(placeId: string) {
  const prefix = `${placeId}::`;
  Array.from(reviewCache.keys())
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => reviewCache.delete(key));
}
