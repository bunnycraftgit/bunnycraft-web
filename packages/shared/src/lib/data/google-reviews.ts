export type PlainGoogleReview = {
  id: string;
  authorName: string;
  authorUrl: string | null;
  photoUrl: string | null;
  rating: number;
  comment: string;
  relativeTime: string | null;
};

export type GoogleReviewsData = {
  rating: number;
  total: number;
  mapsUrl: string | null;
  reviews: PlainGoogleReview[];
};

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

// Re-fetched at most every 6 hours (~120 calls/month), which keeps the
// Places API usage inside Google's free monthly allowance.
const REVALIDATE_SECONDS = 6 * 60 * 60;

// Google Places API (New) returns the business's overall rating plus up to
// 5 reviews. Returns null when not configured or on any error so callers can
// fall back to the store's own reviews.
export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) throw new Error(`Places API responded ${res.status}: ${await res.text()}`);

    const place = (await res.json()) as PlacesResponse;
    const reviews = (place.reviews ?? [])
      .map((r, i) => ({
        id: r.name ?? `google-review-${i}`,
        authorName: r.authorAttribution?.displayName ?? "Google user",
        authorUrl: r.authorAttribution?.uri ?? null,
        photoUrl: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 0,
        comment: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription ?? null,
      }))
      .filter((r) => r.comment.length > 0);

    return {
      rating: place.rating ?? 0,
      total: place.userRatingCount ?? 0,
      mapsUrl: place.googleMapsUri ?? null,
      reviews,
    };
  } catch (err) {
    console.warn(
      "[getGoogleReviews] falling back to store reviews —",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
