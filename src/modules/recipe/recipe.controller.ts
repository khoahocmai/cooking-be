import { AccountPayload, Role } from "@/constants/types"
import { Public, RequireRole } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { ZodValidationPipe } from "@/middlewares/custom-zod-validation-filter"
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { Request } from "express"
import { ControllerGetAllRecipeResponseDTO, CreateRecipeDto, UpdateRecipeDto } from "./dto/recipe.dto"
import { RecipeService } from "./recipe.service"
import {
  CreateRecipeRequest,
  CreateRecipeRequestType,
  FindAllRecipeRequest,
  FindAllRecipeRequestType
} from "./recipe.validation"

@ApiBearerAuth("JWT-auth")
@ApiTags("Recipe")
@Controller("recipes")
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @RequireRole([Role.USER, Role.STAFF])
  @ApiOperation({
    summary: "Create a new recipe",
    description: "Creates a new recipe with the provided details."
  })
  @ApiBody({
    type: CreateRecipeDto,
    description: "Details of the recipe to be created."
  })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(CreateRecipeRequest)) data: CreateRecipeRequestType) {
    const user = req.user as AccountPayload
    const response = await this.recipeService.create(user, data)
    return responses.response200OK(response)
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: "Get all recipes",
    description: "Retrieves a list of all recipes."
  })
  @ApiQuery({ name: "page_index", required: false, type: Number, description: "Page index, default is 1" })
  @ApiQuery({ name: "page_size", required: false, type: Number, description: "Page size, default is 10" })
  @ApiQuery({
    name: "keyword",
    required: false,
    type: String,
    description: "Search keyword for title, description or instructions"
  })
  @ApiQuery({
    name: "difficulty",
    required: false,
    type: String,
    description: "Filter by difficulty level (EASY, MEDIUM, HARD)"
  })
  @ApiQuery({
    name: "tag_ids",
    required: false,
    type: String,
    description: "Comma-separated string (e.g., id1,id2)"
  })
  @ApiQuery({
    name: "ingredient_ids",
    required: false,
    type: String,
    description: "Comma-separated string (e.g., id1,id2))"
  })
  @ApiQuery({ name: "creator_id", required: false, type: String, description: "Filter by creator ID" })
  @ApiOkResponse({
    description: "List of recipes",
    type: ControllerGetAllRecipeResponseDTO
  })
  async findAll(@Query(new ZodValidationPipe(FindAllRecipeRequest)) query: FindAllRecipeRequestType) {
    const { page_index, page_size, ...filters } = query
    const response = await this.recipeService.findAll(page_index || 1, page_size || 10, filters)
    return responses.response200OK(response.messageDetail, response.data)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.recipeService.findOne(+id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipeService.update(+id, updateRecipeDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.recipeService.remove(+id)
  }
}
