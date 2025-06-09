import { GetQueryRequest } from "@/schemas/root.validation"
import { z } from "zod"

const IngredientInput = z.object({
  ingredientId: z.string().uuid("Each ingredientId must be a valid UUID"),
  quantity: z
    .number({
      required_error: "Quantity is required"
    })
    .positive("Quantity must be greater than 0"),
  unit: z
    .string({
      required_error: "Unit is required"
    })
    .min(1, "Unit must be a non-empty string")
})

export const CreateRecipeRequest = z
  .object({
    title: z.string().min(1, "Name is required").max(150, "Name must be less than 150 characters"),
    description: z.string().min(1, "Description is required").max(255, "Description must be less than 255 characters"),
    instructions: z.string(),
    imageUrl: z.string().url("Image URL must be a valid URL"),
    videoUrl: z.string().url("Video URL must be a valid URL").optional(),
    cookingTime: z.number().int().min(1, "Cooking time must be a positive integer, at least 1 minute (unit: minutes)"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
          return { message: "Difficulty must be one of: EASY, MEDIUM, HARD" }
        }
        return { message: ctx.defaultError }
      }
    }),
    ingredients: z.array(IngredientInput).nonempty("At least one ingredient is required"),
    tags: z.array(z.string().uuid("Each tag Id must be a valid UUID")).nonempty("At least one tag Id is required")
  })
  .strict()
export type CreateRecipeRequestType = z.infer<typeof CreateRecipeRequest>

const uuidListString = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true // optional, có thể không có giá trị
      // tách chuỗi theo dấu phẩy, trim từng phần, và kiểm tra tất cả đều là UUID hợp lệ
      return val.split(",").every((id) => z.string().uuid().safeParse(id.trim()).success)
    },
    {
      message: "Each ID must be a valid UUID separated by commas"
    }
  )
export const FindAllRecipeRequest = GetQueryRequest.extend({
  keyword: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  tag_ids: uuidListString,
  ingredient_ids: uuidListString,
  creator_id: z.string().uuid("Creator Id must be a valid UUID").optional()
}).strict()
export type FindAllRecipeRequestType = z.infer<typeof FindAllRecipeRequest>
