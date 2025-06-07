import { BaseEntity } from "@/constants/baseEntity"
import { RecipeIngredient } from "@/modules/recipe-ingredient/entities/recipe-ingredient.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity("Ingredient")
export class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", nullable: false })
  name: string

  @Column({ type: "varchar", nullable: false })
  type: string

  @Column({ type: "varchar", nullable: false })
  imageUrl: string

  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.ingredient)
  recipeIngredients: RecipeIngredient[]
}
