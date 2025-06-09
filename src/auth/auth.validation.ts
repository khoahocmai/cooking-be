import { BaseResponseWithData } from "@/schemas/root.validation"
import { z } from "zod"

export const LoginRequest = z
  .object({
    loginKey: z.string().trim(),
    password: z.string().min(8).max(100).trim()
  })
  .strict()
export type LoginRequestType = z.TypeOf<typeof LoginRequest>

const Account = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string()
})

const JWTResponse = z.object({
  account: Account,
  access_token: z.string(),
  refresh_token: z.string()
})

export const LoginResponse = BaseResponseWithData.extend({
  data: JWTResponse
})
export type LoginResponseType = z.TypeOf<typeof LoginResponse>

export const RegisterRequest = z
  .object({
    email: z.string().email().min(8).max(100).trim(),
    username: z
      .string()
      .min(6, { message: "Username must be at least 6 characters long" })
      .max(100, { message: "Username must be at most 100 characters long" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "Username must not contain special characters" })
      .trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be at most 100 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/, {
        message:
          "Password must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character"
      })
      .trim(),
    role: z.string().trim().optional().default("USER")
  })
  .strict()
export type RegisterRequestType = z.TypeOf<typeof RegisterRequest>

export const RegisterResponse = BaseResponseWithData.extend({
  data: z.string()
}).strict()
export type RegisterResponseType = z.TypeOf<typeof RegisterResponse>

export const RegisterChildRequest = z
  .object({
    username: z
      .string()
      .min(6, { message: "Username must be at least 6 characters long" })
      .max(100, { message: "Username must be at most 100 characters long" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "Username must not contain special characters" })
      .trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be at most 100 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/, {
        message:
          "Password must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character"
      })
      .trim(),
    firstName: z
      .string()
      .trim()
      .min(1, { message: "Tên không được để trống" })
      .max(50, { message: "Tên không được vượt quá 50 ký tự" })
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Họ không được để trống" })
      .max(50, { message: "Họ không được vượt quá 50 ký tự" })
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().default("OTHER"),
    dob: z.string().trim().optional()
  })
  .strict()
export type RegisterChildRequestType = z.TypeOf<typeof RegisterChildRequest>

export const ActiveAccountRequest = z
  .object({
    id: z.string().trim().uuid("Invalid id"),
    code: z.string().trim()
  })
  .strict()
export type ActiveAccountRequestType = z.TypeOf<typeof ActiveAccountRequest>

export const ReactiveAccountRequest = z
  .object({
    email: z.string().email()
  })
  .strict()
export type ReactiveAccountRequestType = z.TypeOf<typeof ReactiveAccountRequest>

export const RequestForgotPasswordRequest = ReactiveAccountRequest // Trường giống với ReactiveAccountRequest -> extend
export type RequestForgotPasswordRequestType = z.TypeOf<typeof RequestForgotPasswordRequest>

export const ResetForgotPasswordRequest = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, { message: "Code must be exactly 6 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be at most 100 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/, {
        message:
          "Password must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character"
      })
      .trim(),
    confirmPassword: z.string(),
    email: z.string().email().min(8).max(100).trim()
  })
  .strict()
export type ResetForgotPasswordRequestType = z.TypeOf<typeof ResetForgotPasswordRequest>

export const ChangePasswordRequest = z
  .object({
    oldPassword: z.string().trim(),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be at most 100 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/, {
        message:
          "Password must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character"
      })
      .trim(),
    confirmPassword: z.string()
  })
  .strict()
export type ChangePasswordRequestType = z.TypeOf<typeof ChangePasswordRequest>

export const ChangeRefreshTokenRequest = z
  .object({
    refreshToken: z.string().trim()
  })
  .strict()
export type ChangeRefreshTokenRequestType = z.TypeOf<typeof ChangeRefreshTokenRequest>
