import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateIngredientDto {
  @ApiProperty({
    description: "The name of the ingredient",
    example: "Tomato"
  })
  name: string
  @ApiProperty({
    description: "The type of the ingredient, e.g., vegetable, fruit, dairy, etc.",
    example: "vegetable"
  })
  type: string // e.g., "vegetable", "fruit", "dairy", etc.
  @ApiPropertyOptional({
    description: "The URL of the ingredient image",
    example: "https://example.com/images/tomato.jpg"
  })
  imageUrl?: string
}

export class UpdateIngredientDto {
  @ApiPropertyOptional({
    description: "The name of the ingredient",
    example: "Tomato"
  })
  name?: string
  @ApiPropertyOptional({
    description: "The type of the ingredient, e.g., vegetable, fruit, dairy, etc.",
    example: "vegetable"
  })
  type?: string // e.g., "vegetable", "fruit", "dairy", etc.
  @ApiPropertyOptional({
    description: "The URL of the ingredient image",
    example: "https://example.com/images/tomato.jpg"
  })
  imageUrl?: string
}
