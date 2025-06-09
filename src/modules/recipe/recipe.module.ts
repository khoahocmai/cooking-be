import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { IngredientModule } from "../ingredient/ingredient.module"
import { TagModule } from "../tag/tag.module"
import { Recipe } from "./entities/recipe.entity"
import { RecipeController } from "./recipe.controller"
import { RecipeService } from "./recipe.service"

@Module({
  imports: [TypeOrmModule.forFeature([Recipe]), IngredientModule, TagModule],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService]
})
export class RecipeModule {}
