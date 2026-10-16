import { Testimonials } from "@/components/marketing/testimonials";
import { getTestimonials } from "@/lib/data/reviews";
import { getGoogleReviews } from "@/lib/data/google-reviews";
import { getPublishedTestimonials } from "@/lib/data/testimonials";

// Priority: testimonials added in Admin → Testimonials, then Google reviews
// (when the Places API is configured), then the store's 5-star product reviews.
export async function TestimonialsSection() {
  const curated = await getPublishedTestimonials();
  if (curated.length > 0) return <Testimonials testimonials={curated} />;

  const google = await getGoogleReviews();
  if (google && google.reviews.length > 0) {
    return (
      <Testimonials
        testimonials={google.reviews}
        google={{ rating: google.rating, total: google.total, mapsUrl: google.mapsUrl }}
      />
    );
  }

  const testimonials = await getTestimonials(8);
  return <Testimonials testimonials={testimonials} />;
}
