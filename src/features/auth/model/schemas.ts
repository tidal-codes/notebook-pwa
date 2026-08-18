import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: "Please enter a valid email address.",
  }),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),

    email: z.email({
      error: "Please enter a valid email address.",
    }),

    password: z.string().min(6, "Password must be at least 6 characters long."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
