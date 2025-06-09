import { z } from "zod"

export const Pagination = z.object({
  pageSize: z.number(),
  totalItem: z.number(),
  currentPage: z.number(),
  maxPageSize: z.number(),
  totalPage: z.number()
})

const DataSchema = z.union([z.array(z.any()), z.record(z.string(), z.any())])

export const BaseResponseNoData = z
  .object({
    statusCode: z.number(),
    message: z.string(),
    messageDetail: z.string(),
    data: z.null().optional() // null hoặc undefined
  })
  .strict()
export type BaseResponseNoDataType = z.infer<typeof BaseResponseNoData>
export const BaseResponseWithData = z
  .object({
    statusCode: z.number(),
    message: z.string(),
    messageDetail: z.string(),
    data: DataSchema
  })
  .strict()
export type BaseResponseWithDataType = z.infer<typeof BaseResponseWithData>

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

export const ArrayOfUUIDsRequest = z.array(UUIDParamRequest)
export type ArrayOfUUIDsRequestType = z.infer<typeof ArrayOfUUIDsRequest>

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
