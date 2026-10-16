import { Testimonials } from "@/components/marketing/testimonials";
import { getTestimonials } from "@/lib/data/reviews";
import { getGoogleReviews } from "@/lib/data/google-reviews";

export async function TestimonialsSection() {
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
