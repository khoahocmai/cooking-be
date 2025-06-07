import { BaseEntity } from "@/constants/baseEntity"
import { RecipeTag } from "@/modules/recipe-tag/entities/recipe-tag.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity("Tag")
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", nullable: false })
  name: string // Tên của thẻ (ví dụ: "Healthy", "Quick", "Vegetarian", v.v.)

  @OneToMany(() => RecipeTag, (RecipeTag) => RecipeTag.tag)
  recipeTags: RecipeTag[]
}
