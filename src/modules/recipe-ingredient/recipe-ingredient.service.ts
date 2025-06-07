import { Injectable } from "@nestjs/common"
import { CreateRecipeIngredientDto, UpdateRecipeIngredientDto } from "./dto/recipe-ingredient.dto"

@Injectable()
export class RecipeIngredientService {
  create(createRecipeIngredientDto: CreateRecipeIngredientDto) {
    return "This action adds a new recipeIngredient"
  }
  findAll() {
    return `This action returns all recipeIngredient`
  }
  findOne(id: number) {
    return `This action returns a #${id} recipeIngredient`
  }
  update(id: number, updateRecipeIngredientDto: UpdateRecipeIngredientDto) {
    return `This action updates a #${id} recipeIngredient`
  }
  remove(id: number) {
    return `This action removes a #${id} recipeIngredient`
  }
}
