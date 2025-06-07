import { BaseEntity } from "@/constants/baseEntity"
import { Ingredient } from "@/modules/ingredient/entities/ingredient.entity"
import { Recipe } from "@/modules/recipe/entities/recipe.entity"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("RecipeIngredient")
export class RecipeIngredient extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "decimal", nullable: true })
  quantity: number // Số lượng nguyên liệu (có thể là số thập phân)

  @Column({ type: "varchar", nullable: false })
  unit: string // Đơn vị đo lường (ví dụ: "gram", "ml", "cup", v.v.)

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, { onDelete: "CASCADE" })
  recipe: Recipe

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, { onDelete: "SET NULL", nullable: true })
  ingredient: Ingredient
}
