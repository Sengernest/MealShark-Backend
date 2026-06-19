import z from "zod";

export const profileSchema = z.object({
    name: z.string(),
    email: z.email(),
    age: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    gender: z.enum(["male", "female"]).optional(),
});

export type profileSchema = z.infer<typeof profileSchema>;

