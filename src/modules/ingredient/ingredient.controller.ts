import { Role } from "@/constants/types"
import { RequireRole } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { ZodValidationPipe } from "@/middlewares/custom-zod-validation-filter"
import {
  ArrayOfUUIDsRequest,
  ArrayOfUUIDsRequestType,
  BaseResponseNoDataType,
  UUIDParamRequest,
  UUIDParamRequestType
} from "@/schemas/root.validation"
import { Body, Controller, Get, Param, Patch, Post, Put, Query } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger"
import { CreateIngredientDto, UpdateIngredientDto } from "./dto/ingredient.dto"
import { IngredientService } from "./ingredient.service"
import {
  CreateIngredientRequest,
  CreateIngredientRequestType,
  GetIngredientQueryRequest,
  GetIngredientQueryRequestType,
  UpdateIngredientRequest,
  UpdateIngredientRequestType
} from "./ingredient.validation"

@ApiBearerAuth("JWT-auth")
@ApiTags("Ingredient")
@Controller("ingredients")
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post()
  @RequireRole([Role.STAFF])
  @ApiOperation({ summary: "Create new ingredients | Require Role: Staff" })
  @ApiBody({
    type: [CreateIngredientDto],
    description:
      "Array of ingredient objects to create. Each object should contain 'name', 'type', and 'imageUrl' properties."
  })
  @ApiOkResponse({
    description: "Created 3 new ingredient(s)"
  })
  @ApiBadRequestResponse({
    description:
      "No new ingredients to create. Ingredients with names 'Tomato' already exist | Created 2 new ingredient(s). Ingredients with names 'Tomato' already exist"
  })
  async create(@Body(new ZodValidationPipe(CreateIngredientRequest)) data: CreateIngredientRequestType) {
    const response = await this.ingredientService.create(data)
    return responses.response200OK(response.messageDetail, response.data)
  }

  @Get()
  @ApiOperation({ summary: "Get all ingredients" })
  @ApiQuery({ name: "page_index", required: false, type: Number, description: "Page index, default is 1" })
  @ApiQuery({ name: "page_size", required: false, type: Number, description: "Page size, default is 10" })
  @ApiQuery({ name: "keyword", required: false, type: String, description: "Search keyword for filtering ingredient" })
  @ApiQuery({ name: "type", required: false, type: String, description: "Search keyword for filtering type" })
  async findAll(@Query(new ZodValidationPipe(GetIngredientQueryRequest)) query: GetIngredientQueryRequestType) {
    const { page_index = 1, page_size = 10, keyword, type } = query
    const response = await this.ingredientService.findAll(page_index, page_size, keyword, type)
    return responses.response200OK(response.messageDetail, response.data)
  }

  @Patch()
  @RequireRole([Role.STAFF])
  @ApiOperation({ summary: "Soft delete multiple ingredients | Require Role: Staff" })
  @ApiBody({
    type: [String],
    description: "Array of ingredient IDs to soft delete"
  })
  async remove(
    @Body(new ZodValidationPipe(ArrayOfUUIDsRequest)) ids: ArrayOfUUIDsRequestType
  ): Promise<BaseResponseNoDataType> {
    const response = await this.ingredientService.remove(ids)
    return responses.response200OK(response)
  }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.ingredientService.findOne(+id)
  // }

  @Put(":id")
  @RequireRole([Role.STAFF])
  @ApiOperation({ summary: "Update ingredient by Id | Require Role: Staff" })
  @ApiBody({
    type: UpdateIngredientDto,
    description: "Ingredient object to update. Should contain 'name', 'type', and 'imageUrl' properties."
  })
  async update(
    @Param("id", new ZodValidationPipe(UUIDParamRequest)) id: UUIDParamRequestType,
    @Body(new ZodValidationPipe(UpdateIngredientRequest)) data: UpdateIngredientRequestType
  ): Promise<any> {
    const response = await this.ingredientService.update(id, data)
    return responses.response200OK(response.messageDetail, response.data)
  }
}
