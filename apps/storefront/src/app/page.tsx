import { Hero } from "@/components/marketing/hero";
import { FeaturedProducts } from "@/components/marketing/featured-products";
import { AboutTeaser } from "@/components/marketing/about-teaser";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <AboutTeaser />
      <TestimonialsSection />
    </>
  );
}
