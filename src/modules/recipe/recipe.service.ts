import { Injectable } from "@nestjs/common"
import { CreateRecipeDto, UpdateRecipeDto } from "./dto/recipe.dto"

@Injectable()
export class RecipeService {
  create(createRecipeDto: CreateRecipeDto) {
    return "This action adds a new recipe"
  }

  findAll() {
    return `This action returns all recipe`
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`
  }
}
