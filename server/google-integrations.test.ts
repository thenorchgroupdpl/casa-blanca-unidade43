/**
 * Tests for Google Reviews Service
 *
 * Testa o comportamento real do serviço:
 * - Sem credenciais → status 'unconfigured', reviews vazio
 * - Com credenciais → chama a API (mockada) e retorna reviews reais
 * - Erro da API → status 'error' com mensagem, reviews vazio
 * - Cache → segunda chamada não refaz o fetch
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGoogleReviews, invalidateGoogleReviewsCache } from './services/googleReviews';

// ============================================
// Google Reviews Service
// ============================================
describe('Google Reviews Service', () => {

  beforeEach(() => {
    vi.resetAllMocks();
    // Limpa cache entre testes (Place IDs fictícios não conflitam)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----- Sem credenciais -----

  it('retorna unconfigured quando placeId é null', async () => {
    const result = await getGoogleReviews(null, 'FAKE_KEY');
    expect(result.status).toBe('unconfigured');
    expect(result.reviews).toHaveLength(0);
  });

  it('retorna unconfigured quando apiKey é null', async () => {
    const result = await getGoogleReviews('ChIJ_test', null);
    expect(result.status).toBe('unconfigured');
    expect(result.reviews).toHaveLength(0);
  });

  it('retorna unconfigured quando ambos são null', async () => {
    const result = await getGoogleReviews(null, null);
    expect(result.status).toBe('unconfigured');
    expect(result.reviews).toHaveLength(0);
  });

  // ----- Sucesso -----

  it('retorna reviews reais quando API responde OK', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          reviews: [
            {
              author_name: 'Maria Silva',
              profile_photo_url: 'https://example.com/photo.jpg',
              rating: 5,
              text: 'Ótimo serviço!',
              relative_time_description: '1 semana atrás',
            },
            {
              author_name: 'João Costa',
              profile_photo_url: '',
              rating: 4,
              text: 'Muito bom, recomendo.',
              relative_time_description: '2 meses atrás',
            },
          ],
        },
      }),
    } as any);

    const placeId = 'ChIJ_real_test_ok';
    const result = await getGoogleReviews(placeId, 'VALID_KEY_OK');

    expect(result.status).toBe('ok');
    expect(result.reviews).toHaveLength(2);
    expect(result.reviews[0].authorName).toBe('Maria Silva');
    expect(result.reviews[0].rating).toBe(5);
    expect(result.reviews[0].isFromGoogle).toBe(true);
    expect(result.reviews[1].authorName).toBe('João Costa');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain('place_id=ChIJ_real_test_ok');
    expect(mockFetch.mock.calls[0][0]).toContain('language=pt-BR');

    invalidateGoogleReviewsCache(placeId);
  });

  it('popula cachedAt no resultado OK', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'OK', result: { reviews: [] } }),
    } as any);

    const placeId = 'ChIJ_cached_at';
    const result = await getGoogleReviews(placeId, 'KEY_CACHE');

    expect(result.cachedAt).toBeInstanceOf(Date);

    invalidateGoogleReviewsCache(placeId);
  });

  // ----- Cache -----

  it('reutiliza cache na segunda chamada sem novo fetch', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          reviews: [
            {
              author_name: 'Ana',
              profile_photo_url: '',
              rating: 5,
              text: 'Perfeito!',
              relative_time_description: 'há 3 dias',
            },
          ],
        },
      }),
    } as any);

    const placeId = 'ChIJ_cache_test';
    const key = 'CACHE_KEY';

    const r1 = await getGoogleReviews(placeId, key);
    const r2 = await getGoogleReviews(placeId, key);

    expect(r1.status).toBe('ok');
    expect(r2.status).toBe('ok');
    expect(mockFetch).toHaveBeenCalledTimes(1); // só 1 fetch, não 2

    invalidateGoogleReviewsCache(placeId);
  });

  it('invalida cache corretamente', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'OK', result: { reviews: [] } }),
    } as any);

    const placeId = 'ChIJ_invalidate';
    const key = 'INV_KEY';

    await getGoogleReviews(placeId, key);
    invalidateGoogleReviewsCache(placeId);
    await getGoogleReviews(placeId, key);

    expect(mockFetch).toHaveBeenCalledTimes(2); // cache foi invalidado → 2 fetches

    invalidateGoogleReviewsCache(placeId);
  });

  // ----- Erros da API -----

  it('retorna status error quando API retorna REQUEST_DENIED', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'REQUEST_DENIED',
        error_message: 'API key inválida ou sem permissão para Places API.',
      }),
    } as any);

    const placeId = 'ChIJ_denied';
    const result = await getGoogleReviews(placeId, 'INVALID_KEY');

    expect(result.status).toBe('error');
    expect(result.reviews).toHaveLength(0);
    expect(result.error).toContain('REQUEST_DENIED');
    expect(result.error).toContain('API key inválida');

    invalidateGoogleReviewsCache(placeId);
  });

  it('retorna status error quando API retorna INVALID_REQUEST', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'INVALID_REQUEST' }),
    } as any);

    const placeId = 'ChIJ_invalid_req';
    const result = await getGoogleReviews(placeId, 'SOME_KEY');

    expect(result.status).toBe('error');
    expect(result.error).toContain('INVALID_REQUEST');

    invalidateGoogleReviewsCache(placeId);
  });

  it('retorna status error em falha de rede', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    const placeId = 'ChIJ_network_fail';
    const result = await getGoogleReviews(placeId, 'SOME_KEY');

    expect(result.status).toBe('error');
    expect(result.reviews).toHaveLength(0);
    expect(result.error).toContain('Network failure');

    invalidateGoogleReviewsCache(placeId);
  });

  it('retorna status error em resposta HTTP não-ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as any);

    const placeId = 'ChIJ_http_error';
    const result = await getGoogleReviews(placeId, 'SOME_KEY');

    expect(result.status).toBe('error');
    expect(result.reviews).toHaveLength(0);

    invalidateGoogleReviewsCache(placeId);
  });

  // ----- Estrutura dos reviews -----

  it('mapeia corretamente campos da API para GoogleReview', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          reviews: [{
            author_name: 'Carlos Test',
            profile_photo_url: 'https://photo.url/img.jpg',
            rating: 3,
            text: 'Razoável',
            relative_time_description: '5 meses atrás',
          }],
        },
      }),
    } as any);

    const placeId = 'ChIJ_map_test';
    const result = await getGoogleReviews(placeId, 'MAP_KEY');

    const review = result.reviews[0];
    expect(review.authorName).toBe('Carlos Test');
    expect(review.authorPhoto).toBe('https://photo.url/img.jpg');
    expect(review.rating).toBe(3);
    expect(review.text).toBe('Razoável');
    expect(review.relativeTime).toBe('5 meses atrás');
    expect(review.isFromGoogle).toBe(true);

    invalidateGoogleReviewsCache(placeId);
  });

  it('usa fallbacks para campos ausentes na API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          reviews: [{ /* sem nenhum campo */ }],
        },
      }),
    } as any);

    const placeId = 'ChIJ_fallback';
    const result = await getGoogleReviews(placeId, 'FALLBACK_KEY');

    const review = result.reviews[0];
    expect(review.authorName).toBe('Anônimo');
    expect(review.authorPhoto).toBe('');
    expect(review.rating).toBe(5);
    expect(review.text).toBe('');
    expect(review.relativeTime).toBe('');
    expect(review.isFromGoogle).toBe(true);

    invalidateGoogleReviewsCache(placeId);
  });

  it('lida com reviews vazio (sem avaliações ainda)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'OK', result: {} }), // sem campo reviews
    } as any);

    const placeId = 'ChIJ_empty_reviews';
    const result = await getGoogleReviews(placeId, 'EMPTY_KEY');

    expect(result.status).toBe('ok');
    expect(result.reviews).toHaveLength(0);

    invalidateGoogleReviewsCache(placeId);
  });
});
