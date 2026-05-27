import z from "zod";

export const signupSchema = z.object({
  id: z.int().positive(),
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});   
