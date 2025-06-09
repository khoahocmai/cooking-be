import { BaseResponseDto, PaginationDto } from "@/constants/baseResponseDto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class IngredientInputDto {
  @ApiProperty({ example: "e38a59c5-45b0-4dd2-bf29-e90b28474b82" })
  ingredientId: string
  @ApiProperty({ example: 100 })
  quantity: number
  @ApiProperty({ example: "gram" })
  unit: string
}

export class CreateRecipeDto {
  @ApiProperty({
    example: "Spaghetti Carbonara",
    description: "The title of the recipe",
    type: String
  })
  title: string
  @ApiProperty({
    example: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
    description: "A brief description of the recipe",
    type: String
  })
  description: string
  @ApiProperty({
    example:
      "1. Cook the spaghetti according to package instructions.\n2. In a bowl, whisk together eggs and cheese.\n3. In a pan, cook pancetta until crispy.\n4. Combine spaghetti with pancetta and egg mixture.",
    description: "Step-by-step instructions for preparing the recipe",
    type: String
  })
  instructions: string
  @ApiProperty({
    example: "https://example.com/image.jpg",
    description: "URL of the recipe image",
    type: String
  })
  imageUrl: string
  @ApiPropertyOptional({
    example: "https://example.com/video.mp4",
    description: "Optional URL of a video demonstrating the recipe",
    type: String,
    required: false
  })
  videoUrl?: string // optional
  @ApiProperty({
    example: 30,
    description: "Cooking time in minutes",
    type: Number
  })
  cookingTime: number // in minutes
  @ApiProperty({
    example: "EASY",
    description: "Difficulty level of the recipe (e.g., EASY, MEDIUM, HARD)",
    type: String
  })
  difficulty: string
  @ApiProperty({
    description: "List of ingredients with quantity and unit",
    type: [IngredientInputDto]
  })
  ingredients: IngredientInputDto[]
  @ApiProperty({
    example: ["78375738-4014-440b-a7c5-b2c75b1d8c76", "e38a59c5-45b0-4dd2-bf29-e90b28474b82"],
    description: "List of tags id associated with the recipe",
    type: [String]
  })
  tags: string[]
}

export class TagDTO {
  @ApiProperty({ example: "8861d337-497d-4d71-9eea-66b4533ab3cd" })
  tagId: string
  @ApiProperty({ example: "Healthy" })
  tagName: string
}
export class IngredientDTO {
  @ApiProperty({ example: "e38a59c5-45b0-4dd2-bf29-e90b28474b82" })
  id: string
  @ApiProperty({ example: "Tomato" })
  name: string
  @ApiProperty({ example: null, nullable: true })
  imageUrl: string | null
}
export class IngredientDetailDTO {
  @ApiProperty({ example: 100 })
  quantity: number
  @ApiProperty({ example: "gram" })
  unit: string
  @ApiProperty({ type: () => IngredientDTO })
  ingredient: IngredientDTO
}
export class CreatorDTO {
  @ApiProperty({ example: "97bc643d-fee0-4ad5-894e-8d23fe5c6549" })
  id: string
  @ApiProperty({ example: "dkstaff" })
  username: string
  @ApiProperty({ example: "Đăng Khoa" })
  firstName: string
  @ApiProperty({ example: "Đỗ Dương" })
  lastName: string
  @ApiProperty({ example: "https://avatar.iran.liara.run/public/boy?username=dkstaff" })
  avatarUrl: string
}
export class GetAllRecipeResponseDTO {
  @ApiProperty({ example: "4efb6813-1335-4e8a-aedc-7f5eb2de34b0" })
  id: string
  @ApiProperty({ example: "Spaghetti Carbonara" })
  title: string
  @ApiProperty({ example: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper." })
  description: string
  @ApiProperty({ example: "Boil pasta. Cook pancetta. Mix with eggs and cheese..." })
  instructions: string
  @ApiProperty({ example: "https://example.com/image.jpg" })
  imageUrl: string
  @ApiProperty({ example: "https://example.com/video.mp4", required: false })
  videoUrl?: string
  @ApiProperty({ example: 30 })
  cookingTime: number
  @ApiProperty({ example: "EASY" })
  difficulty: string
  @ApiProperty({ type: () => CreatorDTO })
  creator: CreatorDTO
  @ApiProperty({ example: "16:21:17-09/06/2025" })
  createdAtFormatted: string
  @ApiProperty({ type: () => [IngredientDetailDTO] })
  ingredients: IngredientDetailDTO[]
  @ApiProperty({ type: () => [TagDTO] })
  tags: TagDTO[]
}

export class ServiceGetAllRecipeResponseDTO {
  @ApiProperty({ type: () => [GetAllRecipeResponseDTO] })
  data: GetAllRecipeResponseDTO[]
  @ApiProperty({
    description: "Pagination information",
    type: () => PaginationDto,
    required: false
  })
  pagination?: PaginationDto
}

export class ControllerGetAllRecipeResponseDTO extends BaseResponseDto {
  @ApiProperty({ type: () => [ServiceGetAllRecipeResponseDTO] })
  data: ServiceGetAllRecipeResponseDTO[]
}

export class UpdateRecipeDto {}
