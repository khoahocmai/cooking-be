import { Pagination } from "@/constants/types"
import responses from "@/helpers/responses"
import { calculatePagination, removeVietnameseTones, toTitleCase } from "@/helpers/utils"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Like, Repository } from "typeorm"
import { CreateIngredientDto } from "./dto/ingredient.dto"
import { Ingredient } from "./entities/ingredient.entity"
import { CreateIngredientRequestType, UpdateIngredientRequestType } from "./ingredient.validation"

@Injectable()
export class IngredientService {
  constructor(@InjectRepository(Ingredient) private readonly ingredientRepository: Repository<Ingredient>) {}
  async create(
    createIngredientDtos: CreateIngredientRequestType
  ): Promise<{ messageDetail: string; data: Ingredient[] }> {
    // Chuẩn hóa input về Title Case
    const normalizedIngredientDtos: CreateIngredientDto[] = createIngredientDtos.map((dto) => ({
      name: toTitleCase(dto.name),
      type: dto.type,
      imageUrl: dto.imageUrl
    }))

    // Tạo Map để loại bỏ các ingredient trùng lặp
    const uniqueIngredientMap = new Map<string, CreateIngredientDto>()
    normalizedIngredientDtos.forEach((dto) => {
      uniqueIngredientMap.set(dto.name, dto)
    })

    const uniqueIngredientDtos = Array.from(uniqueIngredientMap.values())
    const uniqueIngredientNames = uniqueIngredientDtos.map((dto) => dto.name)

    // Tìm tất cả ingredient (kể cả đã xóa) với tên trùng khớp
    const existingIngredients = await this.ingredientRepository.find({
      where: uniqueIngredientNames.map((name) => ({ name })),
      withDeleted: true // Include soft-deleted ingredients
    })

    // Tách thành 2 danh sách: ingredients bình thường và ingredients đã xóa giả
    const activeExistingIngredients = existingIngredients.filter((ingredient) => !ingredient.isDeleted)
    const deletedExistingIngredients = existingIngredients.filter((ingredient) => ingredient.isDeleted)

    const activeExistingIngredientNames = activeExistingIngredients.map((ingredient) => ingredient.name)
    const deletedExistingIngredientNames = deletedExistingIngredients.map((ingredient) => ingredient.name)

    // Danh sách ingredients cần tạo mới (không có trong cả 2 danh sách trên)
    const newIngredientDtos = uniqueIngredientDtos.filter(
      (dto) => !activeExistingIngredientNames.includes(dto.name) && !deletedExistingIngredientNames.includes(dto.name)
    )

    // Khôi phục các ingredient đã xóa giả và cập nhật type và imageUrl
    const restoredIngredients: Ingredient[] = []
    for (const deletedIngredient of deletedExistingIngredients) {
      // Tìm DTO tương ứng để lấy thông tin cập nhật
      const matchingDto = uniqueIngredientDtos.find((dto) => dto.name === deletedIngredient.name)

      if (matchingDto) {
        // Khôi phục và cập nhật type và imageUrl
        deletedIngredient.isDeleted = false
        deletedIngredient.type = matchingDto.type
        deletedIngredient.imageUrl = matchingDto.imageUrl

        const savedIngredient = await this.ingredientRepository.save(deletedIngredient)
        restoredIngredients.push(savedIngredient)
      }
    }

    // Tạo các ingredient hoàn toàn mới
    const createdIngredients: Ingredient[] = []
    for (const createIngredientDto of newIngredientDtos) {
      const ingredient = this.ingredientRepository.create({
        name: createIngredientDto.name,
        type: createIngredientDto.type,
        imageUrl: createIngredientDto.imageUrl
      })
      const savedIngredient = await this.ingredientRepository.save(ingredient)
      createdIngredients.push(savedIngredient)
    }

    // Tổng hợp các ingredient đã xử lý
    const processedIngredients = [...createdIngredients, ...restoredIngredients]

    if (processedIngredients.length === 0) {
      const messageDetail = `No new ingredients to create. Ingredients with names '${activeExistingIngredientNames.join(", ")}' already exist`
      throw responses.response400BadRequest(messageDetail, activeExistingIngredients)
    }

    // Tạo message phù hợp
    let messageDetail = ""
    if (createdIngredients.length > 0 && restoredIngredients.length > 0) {
      messageDetail = `Created ${createdIngredients.length} new ingredient(s) and restored ${restoredIngredients.length} deleted ingredient(s)`
    } else if (createdIngredients.length > 0) {
      messageDetail = `Created ${createdIngredients.length} new ingredient(s)`
    } else if (restoredIngredients.length > 0) {
      messageDetail = `Restored ${restoredIngredients.length} deleted ingredient(s)`
    }

    if (activeExistingIngredientNames.length > 0) {
      messageDetail += `. Ingredients with names '${activeExistingIngredientNames.join(", ")}' already exist`
    }

    return { messageDetail, data: processedIngredients }
  }

  async findAll(
    pageIndex: number,
    pageSize: number,
    keyword: string,
    type: string
  ): Promise<{
    messageDetail: string
    data: {
      data: Ingredient[]
      pagination: Pagination
    }
  }> {
    const whereCondition: Record<string, any> = {
      isDeleted: false
    }

    if (keyword) {
      const titleNoTone = removeVietnameseTones(keyword)
      whereCondition.titleNoTone = Like(`%${titleNoTone}%`)
    }

    if (type) {
      const typeNoTone = removeVietnameseTones(keyword)
      whereCondition.type = Like(`%${typeNoTone}%`)
    }

    const [courses, count] = await this.ingredientRepository.findAndCount({
      where: whereCondition,
      take: pageSize,
      skip: (pageIndex - 1) * pageSize
    })

    const pagination = calculatePagination(count, pageSize, pageIndex)

    return {
      messageDetail: "Retrieved all Ingredients successfully",
      data: {
        data: courses,
        pagination
      }
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} ingredient`
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientRequestType
  ): Promise<{
    messageDetail: string
    data: Ingredient
  }> {
    // Find the ingredient by Id
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      withDeleted: false
    })

    // Check if ingredient exists
    if (!ingredient) {
      throw responses.response404NotFound(`Ingredient with Id ${id} not found`, null)
    }

    // Check if we're trying to update name to an existing name
    if (updateIngredientDto.name && updateIngredientDto.name !== ingredient.name) {
      const existingIngredient = await this.ingredientRepository.findOne({
        where: { name: toTitleCase(updateIngredientDto.name), isDeleted: false }
      })

      if (existingIngredient) {
        throw responses.response400BadRequest(
          `Cannot update: An ingredient with name '${toTitleCase(updateIngredientDto.name)}' already exists`,
          existingIngredient
        )
      }
    }

    // Update ingredient properties
    if (updateIngredientDto.name) {
      ingredient.name = toTitleCase(updateIngredientDto.name)
    }

    if (updateIngredientDto.type !== undefined) {
      ingredient.type = updateIngredientDto.type
    }

    if (updateIngredientDto.imageUrl !== undefined) {
      ingredient.imageUrl = updateIngredientDto.imageUrl
    }

    // Save the updated ingredient
    const updatedIngredient = await this.ingredientRepository.save(ingredient)

    return {
      messageDetail: `Ingredient has been successfully updated`,
      data: updatedIngredient
    }
  }

  async remove(ids: string[]): Promise<string> {
    if (!ids || ids.length === 0) {
      throw responses.response400BadRequest("No ingredient IDs provided", null)
    }

    // Find the ingredients to delete
    const ingredientsToDelete = await this.ingredientRepository.find({
      where: ids.map((id) => ({ id })),
      withDeleted: false // Only target non-deleted ingredients
    })

    if (ingredientsToDelete.length === 0) {
      throw responses.response404NotFound(`No ingredients found with the provided IDs: ${ids.join(", ")}`, null)
    }

    // Mark ingredients as deleted
    const softDeletePromises = ingredientsToDelete.map((ingredient) => {
      ingredient.isDeleted = true
      return this.ingredientRepository.save(ingredient)
    })

    await Promise.all(softDeletePromises)

    // Create appropriate message
    let messageDetail = `Successfully soft-deleted ${ingredientsToDelete.length} ingredient(s)`

    // Check if any requested IDs weren't found
    const notFoundIds = ids.filter((id) => !ingredientsToDelete.map((ingredient) => ingredient.id).includes(id))

    if (notFoundIds.length > 0) {
      messageDetail += `. Could not find ingredients with IDs: ${notFoundIds.join(", ")}`
    }

    return messageDetail
  }
}
