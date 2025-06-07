import { BaseResponse, GetQueryRequest } from "@/schemas/root.validation"
import { z } from "zod"

const UserDetailSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  dob: z.date(),
  address: z.string(),
  gender: z.string(),
  avatarUrl: z.string().url()
})

const GetAllUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  accountType: z.string(),
  isActive: z.boolean(),
  userDetail: UserDetailSchema.nullable(),
  createAtFormatted: z.string(),
  updateAtFormatted: z.string()
})

export const GetUserQueryRequest = GetQueryRequest.extend({
  keyword: z.string().trim().optional(),
  isDel: z.enum(["t", "f"]).optional().default("f")
}).strict()
export type GetUserQueryRequestType = z.infer<typeof GetUserQueryRequest>

export const GetUsersResponse = BaseResponse.extend({
  data: GetAllUserSchema
})
export type GetUsersResponseType = z.TypeOf<typeof GetUsersResponse>

const GetUserByIdSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  accountType: z.string(),
  isActive: z.boolean(),
  userDetail: UserDetailSchema.nullable(),
  isDeleted: z.boolean(),
  createAt: z.date(),
  updateAt: z.date()
})
export const GetUserByIdResponse = BaseResponse.extend({
  data: GetUserByIdSchema
})
export type GetUserByIdResponseType = z.TypeOf<typeof GetUserByIdResponse>

const GetUserProfile = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  accountType: z.string(),
  userDetail: UserDetailSchema.nullable()
})
export const GetUserProfileResponse = BaseResponse.extend({
  data: GetUserProfile
})
export type GetUserProfileResponseType = z.TypeOf<typeof GetUserProfileResponse>

export const UpdateUserInfoRequest = z
  .object({
    phone: z
      .string()
      .optional()
      .refine((value) => !value || /^[0-9]{9,10}$/.test(value), {
        message: "Phone must contain 9-10 digits."
      }),
    firstName: z
      .string()
      .min(1, "First name cannot be empty.")
      .max(50, "First name cannot exceed 50 characters.")
      .optional(),
    lastName: z
      .string()
      .min(1, "Last name cannot be empty.")
      .max(50, "Last name cannot exceed 50 characters.")
      .optional(),
    dob: z.string().optional(),
    address: z.string().max(255, "Address cannot exceed 255 characters.").optional(),
    gender: z
      .enum(["MALE", "FEMALE", "OTHER"])
      .optional()
      .refine((value) => value === undefined || ["MALE", "FEMALE", "OTHER"].includes(value), {
        message: "Gender must be 'MALE', 'FEMALE', or 'OTHER'."
      }),
    avatarUrl: z.string().url("Avatar URL must be a valid URL.").optional()
  })
  .strict()
export type UpdateUserInfoRequestType = z.infer<typeof UpdateUserInfoRequest>

export const CreateUserRequest = z
  .object({
    email: z.string().email().min(8).max(100).trim(),
    username: z
      .string()
      .min(6, { message: "Username must be at least 6 characters long" })
      .max(100, { message: "Username must be at most 100 characters long" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "Username must not contain special characters" })
      .trim(),
    role: z.enum(["USER", "STAFF", "ADMIN"]).optional().default("USER")
  })
  .strict()
export type CreateUserRequestType = z.infer<typeof CreateUserRequest>

export const LinkAccountRequest = z
  .object({
    email: z.string().email().min(8).max(100).trim()
  })
  .strict()
export type LinkAccountRequestType = z.infer<typeof LinkAccountRequest>

export const GetMyCourseQueryRequest = GetQueryRequest
export type GetMyCourseQueryRequestType = z.infer<typeof GetMyCourseQueryRequest>

const GetMyChildCourseSchema = z.array(
  z
    .object({
      childId: z.string(),
      childName: z.string(),
      totalCourse: z.number(),
      totalCoursesCompleted: z.number()
    })
    .strict()
)
export const GetMyChildCourseResponse = BaseResponse.extend({
  data: GetMyChildCourseSchema
})
export type GetMyChildCourseResponseType = z.infer<typeof GetMyChildCourseResponse>

export const UpdateGamePointRequest = z
  .object({
    point: z.number().min(0, "Game point must be a positive number")
  })
  .strict()
export type UpdateGamePointRequestType = z.infer<typeof UpdateGamePointRequest>

const CertificateItemSchema = z.object({
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  courseImageUrl: z.string().url().nullable(),
  certificateUrl: z.string().url(),
  completedDate: z.string().or(z.date()),
  score: z.number().min(0).max(100)
})
export const GetCertificateResponse = BaseResponse.extend({
  data: z.array(CertificateItemSchema)
})
export type GetCertificateResponseType = z.infer<typeof GetCertificateResponse>

export const GetTopGameKidSchema = z.object({
  userId: z.string(),
  username: z.string(),
  gamePoints: z.number(),
  avatarUrl: z.string().url().nullable(),
  firstName: z.string(),
  lastName: z.string()
})
export const GetTopGameKidResponse = BaseResponse.extend({
  data: z.array(GetTopGameKidSchema)
})
export type GetTopGameKidResponseType = z.infer<typeof GetTopGameKidResponse>

const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string()
})

const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  level: z.string(),
  durationDisplay: z.string(),
  totalLearningTime: z.number().int().min(0),
  totalLearningTimeDisplay: z.string(),
  categories: z.array(CategorySchema),
  totalLesson: z.number().int().min(0),
  totalLessonFinished: z.number().int().min(0),
  completionRate: z.number().int().min(0).max(100),
  author: z.string(),
  imageUrl: z.string().url(),
  createdAtFormatted: z.string(),
  updatedAtFormatted: z.string(),
  nextChapter: z.any().nullable(),
  isVisible: z.boolean()
})

export const GetMyCourseResponse = BaseResponse.extend({
  data: z.array(CourseSchema)
})
export type GetMyCourseResponseType = z.infer<typeof GetMyCourseResponse>
