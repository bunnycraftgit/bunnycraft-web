import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().min(10, "Write at least 10 characters.").max(1000),
  photoUrl: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// Public "Share your experience" form on the homepage. Submissions are saved
// unpublished and only appear once an admin approves them.
export const submitTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  place: z.string().trim().max(100).optional(),
  photoUrl: z
    .string()
    .regex(/^\/api\/files\/[\w.-]+$/, "Invalid photo.")
    .optional(),
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().trim().min(10, "Write at least 10 characters.").max(1000),
  // Honeypot — hidden from people, often filled in by bots.
  website: z.string().optional(),
});

export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>;
