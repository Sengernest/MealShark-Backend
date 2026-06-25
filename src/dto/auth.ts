import z from "zod";

export const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1),
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  })
  // Security step: Ensure they aren't changing it to the exact same string
  .refine((data) => data.currentPassword !== data.newPassword, {
    message:
      "New password cannot be the same as your current password. Please try again.",
    path: ["newPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
