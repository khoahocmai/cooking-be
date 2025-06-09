import { BaseResponseWithData, GetQueryRequest, Pagination } from "@/schemas/root.validation"
import { z } from "zod"

const Tag = z
  .object({
    id: z.number(),
    name: z.string(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

export const CreateTagRequest = z.array(
  z
    .object({
      name: z.string().min(1, "Tag name must not be empty").max(50, "Tag name must not exceed 50 characters")
    })
    .strict()
)
export type CreateTagRequestType = z.infer<typeof CreateTagRequest>

export const CreateTagResponse = BaseResponseWithData.extend({
  data: z.array(Tag)
})
export type CreateTagResponseType = z.infer<typeof CreateTagResponse>

export const GetAllTagQueryRequest = GetQueryRequest.extend({
  keyword: z.string().optional()
})
export type GetAllTagQueryRequestType = z.infer<typeof GetAllTagQueryRequest>

export const GetAllTagResponse = BaseResponseWithData.extend({
  data: z.array(
    z.object({
      data: z.array(Tag),
      pagination: Pagination
    })
  )
}).strict()
export type GetAllTagResponseType = z.infer<typeof GetAllTagResponse>
