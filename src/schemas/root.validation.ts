import { z } from "zod"

export const Pagination = z.object({
  pageSize: z.number(),
  totalItem: z.number(),
  currentPage: z.number(),
  maxPageSize: z.number(),
  totalPage: z.number()
})

export const BaseResponse = z
  .object({
    statusCode: z.number(),
    message: z.string(),
    messageDetail: z.string(),
    data: z.union([z.array(z.any()), z.record(z.string(), z.any())]).optional()
  })
  .strict()
export type BaseResponseType = z.TypeOf<typeof BaseResponse>

export const UUIDParamRequest = z
  .string({
    required_error: "Param has content 'Id' is required",
    invalid_type_error: "Param has content 'Id' must be a valid UUID"
  })
  .uuid("Invalid UUID format")
export type UUIDParamRequestType = z.infer<typeof UUIDParamRequest>

export const IdentifierParamRequest = z.string({
  required_error: "Param has content 'Identifier' is required",
  invalid_type_error: "Param has content 'Identifier' must be a valid UUID or slug"
})
export type IdentifierParamRequestType = z.infer<typeof IdentifierParamRequest>

export const GetQueryRequest = z
  .object({
    page_index: z
      .string()
      .regex(/^\d+$/, "Page index must be a positive integer")
      .transform((val) => parseInt(val, 10))
      .optional()
      .default("1"), // Default value as string
    page_size: z
      .string()
      .regex(/^\d+$/, "Page size must be a positive integer")
      .transform((val) => parseInt(val, 10))
      .optional()
      .default("10") // Default value as string
  })
  .strict()
export type GetQueryRequestType = z.infer<typeof GetQueryRequest>
