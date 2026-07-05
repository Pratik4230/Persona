import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  bio: z.string().max(280, "Bio must be 280 characters or less"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
