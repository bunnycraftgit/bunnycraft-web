import { Testimonials } from "@/components/marketing/testimonials";
import { getTestimonials } from "@/lib/data/reviews";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials(8);
  return <Testimonials testimonials={testimonials} />;
}
