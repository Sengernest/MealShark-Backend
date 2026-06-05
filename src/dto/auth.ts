import z from "zod";

export const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});   

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type SignupSchema = z.infer<typeof signupSchema>
export type LoginSchema = z.infer<typeof loginSchema>