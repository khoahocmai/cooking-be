import { BaseEntity } from "@/constants/baseEntity"
import { Account } from "@/modules/account/entities/account.entity"
import { RecipeIngredient } from "@/modules/recipe-ingredient/entities/recipe-ingredient.entity"
import { RecipeTag } from "@/modules/recipe-tag/entities/recipe-tag.entity"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity("Recipe")
export class Recipe extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", nullable: false })
  title: string

  @Column({ type: "text", nullable: false })
  description: string

  @Column({ type: "text", nullable: false })
  instructions: string

  @Column({ type: "varchar", nullable: false })
  imageUrl: string

  @Column({ type: "varchar", nullable: true })
  videoUrl: string

  @Column({ type: "int", nullable: false })
  cookingTime: number // Thời gian nấu ăn (tính bằng phút)

  @Column({ type: "enum", enum: ["EASY", "MEDIUM", "HARD"], default: "EASY" })
  difficulty: string // Độ khó của công thức (ví dụ: "Easy", "Medium", "Hard")

  @ManyToOne(() => Account, (account) => account.recipes, { onDelete: "CASCADE" })
  @JoinColumn()
  createdBy: Account

  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.recipe)
  recipeIngredients: RecipeIngredient[]

  @OneToMany(() => RecipeTag, (RecipeTag) => RecipeTag.recipe)
  recipeTags: RecipeTag[]
}
