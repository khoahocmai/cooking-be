import { BaseEntity } from "@/constants/baseEntity"
import { Recipe } from "@/modules/recipe/entities/recipe.entity"
import { Tag } from "@/modules/tag/entities/tag.entity"
import { Entity, ManyToOne, PrimaryColumn } from "typeorm"

@Entity("RecipeTag")
export class RecipeTag extends BaseEntity {
  @PrimaryColumn("uuid")
  recipeId: string

  @PrimaryColumn("uuid")
  tagId: string

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeTags, { onDelete: "CASCADE" })
  recipe: Recipe

  @ManyToOne(() => Tag, (tag) => tag.recipeTags, { onDelete: "SET NULL", nullable: true })
  tag: Tag
}
