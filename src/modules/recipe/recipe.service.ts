import { PaginationDto } from "@/constants/baseResponseDto"
import { AccountPayload } from "@/constants/types"
import responses from "@/helpers/responses"
import { calculatePagination, formatDate } from "@/helpers/utils"
import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { IngredientService } from "../ingredient/ingredient.service"
import { RecipeIngredient } from "../recipe-ingredient/entities/recipe-ingredient.entity"
import { RecipeTag } from "../recipe-tag/entities/recipe-tag.entity"
import { TagService } from "../tag/tag.service"
import { GetAllRecipeResponseDTO, ServiceGetAllRecipeResponseDTO, UpdateRecipeDto } from "./dto/recipe.dto"
import { Recipe } from "./entities/recipe.entity"
import { CreateRecipeRequestType } from "./recipe.validation"

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepository: Repository<Recipe>,
    @Inject(IngredientService) private readonly ingredientService: IngredientService,
    @Inject(TagService) private readonly tagService: TagService
  ) {}

  async create(user: AccountPayload, createRecipeDto: CreateRecipeRequestType): Promise<string> {
    try {
      // Start a transaction to ensure data consistency
      const queryRunner = this.recipeRepository.manager.connection.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        // Create the base recipe entity
        const recipe = this.recipeRepository.create({
          title: createRecipeDto.title,
          description: createRecipeDto.description,
          instructions: createRecipeDto.instructions,
          imageUrl: createRecipeDto.imageUrl,
          videoUrl: createRecipeDto.videoUrl,
          cookingTime: createRecipeDto.cookingTime,
          difficulty: createRecipeDto.difficulty,
          creatorId: user.id
        })

        // Save the recipe first to get its ID
        const savedRecipe = await queryRunner.manager.save(recipe)

        // Handle ingredient relationships
        if (createRecipeDto.ingredients && createRecipeDto.ingredients.length > 0) {
          // Validate that all ingredient IDs exist
          const ingredientIds = createRecipeDto.ingredients.map((i) => i.ingredientId)
          const foundIngredients = await this.ingredientService.findIngredientByIds(ingredientIds)

          if (foundIngredients.length !== ingredientIds.length) {
            // Some ingredients were not found
            const foundIds = foundIngredients.map((ing) => ing.id)
            const missingIds = ingredientIds.filter((id) => !foundIds.includes(id))
            throw responses.response404NotFound(
              `Some ingredients could not be found: ${missingIds.join(", ")}`,
              missingIds
            )
          }

          // Create recipe-ingredient relationships
          for (const input of createRecipeDto.ingredients) {
            const matchedIngredient = foundIngredients.find((ing) => ing.id === input.ingredientId)
            if (!matchedIngredient) continue

            const recipeIngredient = new RecipeIngredient()
            recipeIngredient.recipe = savedRecipe
            recipeIngredient.ingredient = matchedIngredient
            recipeIngredient.quantity = input.quantity
            recipeIngredient.unit = input.unit
            await queryRunner.manager.save(recipeIngredient)
          }
        }

        // Handle tags if they exist in your DTO and model
        if (createRecipeDto.tags && createRecipeDto.tags.length > 0) {
          // Validate that all tag IDs exist
          const tagIds = createRecipeDto.tags
          const foundTags = await this.tagService.findTagByIds(tagIds)

          if (foundTags.length !== tagIds.length) {
            // Some tags were not found
            const foundIds = foundTags.map((tag) => tag.id)
            const missingIds = tagIds.filter((id) => !foundIds.includes(id))
            throw responses.response404NotFound(`Some tags could not be found: ${missingIds.join(", ")}`, missingIds)
          }

          // Create recipe-tag relationships
          for (const tag of foundTags) {
            const recipeTag = new RecipeTag()
            recipeTag.recipe = savedRecipe
            recipeTag.tag = tag
            await queryRunner.manager.save(recipeTag)
          }
        }

        // Commit the transaction
        await queryRunner.commitTransaction()

        return "Recipe created successfully"
      } catch (error) {
        // Rollback transaction in case of error
        await queryRunner.rollbackTransaction()
        throw error
      } finally {
        // Release the query runner
        await queryRunner.release()
      }
    } catch (error) {
      throw responses.response500InternalError("Failed to create recipe", error)
    }
  }

  async findAll(
    pageIndex = 1,
    pageSize = 10,
    filters: {
      keyword?: string
      difficulty?: string
      tag_ids?: string
      ingredient_ids?: string
      creatorId?: string
    } = {}
  ): Promise<{
    messageDetail: string
    data: ServiceGetAllRecipeResponseDTO
  }> {
    try {
      // Build the query
      const queryBuilder = this.recipeRepository
        .createQueryBuilder("recipe")
        .select([
          "recipe.id",
          "recipe.title",
          "recipe.description",
          "recipe.imageUrl",
          "recipe.cookingTime",
          "recipe.difficulty",
          "recipe.createdAt",
          "recipeIngredients.quantity",
          "recipeIngredients.unit",
          "ingredient.id",
          "ingredient.name",
          "ingredient.imageUrl",
          "recipeTags.tagId",
          "tag.name",
          "creator.id",
          "creator.username",
          "userInfo.firstName",
          "userInfo.lastName",
          "userInfo.avatarUrl"
        ])
        .leftJoinAndSelect("recipe.recipeIngredients", "recipeIngredients")
        .leftJoinAndSelect("recipeIngredients.ingredient", "ingredient")
        .leftJoinAndSelect("recipe.recipeTags", "recipeTags")
        .leftJoinAndSelect("recipeTags.tag", "tag")
        .leftJoinAndSelect("recipe.creator", "creator")
        .leftJoinAndSelect("creator.userInfo", "userInfo")

      // Apply filters
      if (filters.keyword) {
        queryBuilder.andWhere(
          "(recipe.title ILIKE :keyword OR recipe.description ILIKE :keyword OR recipe.instructions ILIKE :keyword)",
          { keyword: `%${filters.keyword}%` }
        )
      }

      if (filters.difficulty) {
        queryBuilder.andWhere("recipe.difficulty = :difficulty", { difficulty: filters.difficulty })
      }

      if (filters.creatorId) {
        queryBuilder.andWhere("recipe.creatorId = :creatorId", { creatorId: filters.creatorId })
      }

      if (filters.tag_ids) {
        const tagIdsArray = filters.tag_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
        if (tagIdsArray.length > 0) {
          queryBuilder.andWhere(
            (qb) => {
              const subQuery = qb
                .subQuery()
                .select("rt.recipeId")
                .from("RecipeTag", "rt")
                .where("rt.tagId IN (:...tag_ids)")
                .getQuery()
              return "recipe.id IN " + subQuery
            },
            { tag_ids: tagIdsArray }
          )
        }
      }

      if (filters.ingredient_ids) {
        const ingredientIdsArray = filters.ingredient_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
        if (ingredientIdsArray.length > 0) {
          queryBuilder.andWhere(
            (qb) => {
              const subQuery = qb
                .subQuery()
                .select("ri.recipeId")
                .from("RecipeIngredient", "ri")
                .where("ri.ingredientId IN (:...ingredient_ids)")
                .getQuery()
              return "recipe.id IN " + subQuery
            },
            { ingredient_ids: ingredientIdsArray }
          )
        }
      }

      // Apply pagination
      queryBuilder
        .orderBy("recipe.createdAt", "DESC")
        .skip((pageIndex - 1) * pageSize)
        .take(pageSize)

      console.log(queryBuilder.getSql())

      // Execute query
      const [recipes, total] = await queryBuilder.getManyAndCount()

      // Calculate pagination info
      const pagination: PaginationDto = calculatePagination(total, pageSize, pageIndex)

      return {
        messageDetail: "Recipes retrieved successfully",
        data: {
          data: await Promise.all(recipes.map((recipe) => this.convertToRecipeResponse(recipe))),
          pagination
        }
      }
    } catch (error) {
      throw responses.response500InternalError("Failed to retrieve recipes", error)
    }
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

  async convertToRecipeResponse(recipe: Recipe): Promise<GetAllRecipeResponseDTO> {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl,
      videoUrl: recipe.videoUrl,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      creator: {
        id: recipe.creator?.id ?? null,
        username: recipe.creator?.username ?? null,
        firstName: recipe.creator?.userInfo?.firstName ?? null,
        lastName: recipe.creator?.userInfo?.lastName ?? null,
        avatarUrl: recipe.creator?.userInfo?.avatarUrl ?? null
      },
      createdAtFormatted: formatDate(recipe.createdAt),
      ingredients: (recipe.recipeIngredients ?? []).map((ri) => ({
        quantity: ri.quantity,
        unit: ri.unit,
        ingredient: {
          id: ri.ingredient?.id ?? null,
          name: ri.ingredient?.name ?? null,
          imageUrl: ri.ingredient?.imageUrl ?? null
        }
      })),
      tags: (recipe.recipeTags ?? []).map((rt) => ({
        tagId: rt.tag?.id ?? null,
        tagName: rt.tag?.name ?? null
      }))
    }
  }
}
