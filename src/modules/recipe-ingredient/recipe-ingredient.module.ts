import { Module } from '@nestjs/common';
import { RecipeIngredientService } from './recipe-ingredient.service';
import { RecipeIngredientController } from './recipe-ingredient.controller';

@Module({
  controllers: [RecipeIngredientController],
  providers: [RecipeIngredientService],
})
export class RecipeIngredientModule {}
