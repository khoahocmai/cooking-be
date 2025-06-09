import { GetQueryRequest } from "@/schemas/root.validation"
import { z } from "zod"

export const CreateIngredientRequest = z.array(
  z
    .object({
      name: z
        .string()
        .min(1, "Ingredient name must not be empty")
        .max(50, "Ingredient name must not exceed 50 characters"),
      type: z
        .string()
        .min(1, "Ingredient type must not be empty")
        .max(50, "Ingredient type must not exceed 50 characters"),
      imageUrl: z.string().url("Image URL must be a valid URL").nullable().optional()
    })
    .strict()
)
export type CreateIngredientRequestType = z.infer<typeof CreateIngredientRequest>

export const GetIngredientQueryRequest = GetQueryRequest.extend({
  keyword: z.string().optional(),
  type: z.string().optional()
})
export type GetIngredientQueryRequestType = z.infer<typeof GetIngredientQueryRequest>

export const UpdateIngredientRequest = z
  .object({
    name: z
      .string()
      .min(1, "Ingredient name must not be empty")
      .max(50, "Ingredient name must not exceed 50 characters")
      .optional(),
    type: z
      .string()
      .min(1, "Ingredient type must not be empty")
      .max(50, "Ingredient type must not exceed 50 characters")
      .optional(),
    imageUrl: z.string().url("Image URL must be a valid URL").nullable().optional()
  })
  .strict()

export type UpdateIngredientRequestType = z.infer<typeof UpdateIngredientRequest>
