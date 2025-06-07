import { Injectable } from "@nestjs/common"
import { CreateIngredientDto, UpdateIngredientDto } from "./dto/ingredient.dto"

@Injectable()
export class IngredientService {
  create(createIngredientDto: CreateIngredientDto) {
    return "This action adds a new ingredient"
  }

  findAll() {
    return `This action returns all ingredient`
  }

  findOne(id: number) {
    return `This action returns a #${id} ingredient`
  }

  update(id: number, updateIngredientDto: UpdateIngredientDto) {
    return `This action updates a #${id} ingredient`
  }

  remove(id: number) {
    return `This action removes a #${id} ingredient`
  }
}
