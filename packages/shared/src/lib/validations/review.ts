import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().min(10, "Write at least 10 characters.").max(1000),
  photoUrl: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
