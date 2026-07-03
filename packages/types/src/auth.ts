import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  name: z.string().min(1, "Tên không được để trống").max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export type Plan = "FREE" | "PRO";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  plan: Plan;
  authProvider: AuthProvider;
  defaultCurrency: string;
  locale: string;
  createdAt: string;
}

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullish(),
  defaultCurrency: z.string().length(3).optional(),
  locale: z.string().min(2).max(10).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserDto;
}
