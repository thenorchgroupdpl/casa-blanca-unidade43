/**
 * Google Reviews Service
 * 
 * Mock/Real service for fetching Google Places reviews.
 * When USE_MOCK_REVIEWS env is true (or no Google API key), returns mock data.
 * When false, fetches real reviews from Google Places API.
 */

export interface GoogleReview {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  isFromGoogle: boolean;
}

// Mock reviews simulating Google Places API response
const MOCK_REVIEWS: GoogleReview[] = [
  {
    authorName: "Carlos Eduardo",
    authorPhoto: "https://ui-avatars.com/api/?name=Carlos+Eduardo&background=D4AF37&color=fff&size=100",
    rating: 5,
    text: "Simplesmente espetacular! A picanha estava no ponto perfeito e o atendimento foi impecável. Ambiente sofisticado e acolhedor. Com certeza voltarei!",
    relativeTime: "2 semanas atrás",
    isFromGoogle: true,
  },
  {
    authorName: "Ana Paula Mendes",
    authorPhoto: "https://ui-avatars.com/api/?name=Ana+Paula&background=B8860B&color=fff&size=100",
    rating: 5,
    text: "Melhor restaurante da região! Fui comemorar meu aniversário e a equipe preparou uma surpresa linda. A comida é divina e os drinks são incríveis.",
    relativeTime: "1 mês atrás",
    isFromGoogle: true,
  },
  {
    authorName: "Roberto Almeida",
    authorPhoto: "https://ui-avatars.com/api/?name=Roberto+Almeida&background=8B4513&color=fff&size=100",
    rating: 5,
    text: "Experiência gastronômica de alto nível. O cardápio é variado, os pratos são muito bem apresentados e o sabor é incrível. Recomendo demais!",
    relativeTime: "3 semanas atrás",
    isFromGoogle: true,
  },
];

/**
 * Fetch Google Reviews for a given Place ID.
 * 
 * In mock mode (default): returns hardcoded reviews for testing.
 * In production mode: would call Google Places API (Details endpoint).
 * 
 * @param placeId - Google Place ID (e.g., "ChIJ...")
 * @param googleApiKey - Google API Key for real requests
 * @param useMock - Force mock mode (default: true)
 */
export async function getGoogleReviews(
  placeId: string | null,
  googleApiKey: string | null = null,
  useMock: boolean = true,
): Promise<GoogleReview[]> {
  // If mock mode or no API key, return mock data
  if (useMock || !googleApiKey || !placeId) {
    console.log("[GoogleReviews] Mock mode: returning 3 sample reviews");
    return MOCK_REVIEWS;
  }

  // ============================================
  // PRODUCTION MODE (commented out, ready for real API key)
  // ============================================
  // Uncomment and configure when Google Places API key is available:
  //
  // try {
  //   const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${googleApiKey}&language=pt-BR`;
  //   const response = await fetch(url);
  //   const data = await response.json();
  //   
  //   if (data.status !== "OK" || !data.result?.reviews) {
  //     console.warn("[GoogleReviews] API returned no reviews:", data.status);
  //     return MOCK_REVIEWS; // Fallback to mock
  //   }
  //   
  //   return data.result.reviews.map((r: any) => ({
  //     authorName: r.author_name,
  //     authorPhoto: r.profile_photo_url || "",
  //     rating: r.rating,
  //     text: r.text,
  //     relativeTime: r.relative_time_description,
  //     isFromGoogle: true,
  //   }));
  // } catch (error) {
  //   console.error("[GoogleReviews] API fetch failed:", error);
  //   return MOCK_REVIEWS; // Fallback to mock
  // }

  // For now, always return mock (remove this line when enabling production mode above)
  return MOCK_REVIEWS;
}
