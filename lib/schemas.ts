import { z } from 'zod';


export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');


export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(3, 'Email must be at least 3 characters')
  .max(255, 'Email must not exceed 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /\d/.test(password),
    'Password must contain at least one number'
  );


export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .min(5, 'URL must be at least 5 characters')
  .max(2048, 'URL must not exceed 2048 characters')
  .refine(
    (url) => {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'URL must start with http:// or https://'
  );


export const createUrlSchema = z.object({
  originalUrl: urlSchema,
  customAlias: z
    .string()
    .max(50, 'Alias must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]*$/, 'Alias can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
});

export type CreateUrlFormData = z.infer<typeof createUrlSchema>;

export const getValidationError = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};
