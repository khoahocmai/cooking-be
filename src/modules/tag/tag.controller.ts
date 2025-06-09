import { Role } from "@/constants/types"
import { Public, RequireRole } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { ZodValidationPipe } from "@/middlewares/custom-zod-validation-filter"
import { ArrayOfUUIDsRequest, ArrayOfUUIDsRequestType, BaseResponseNoDataType } from "@/schemas/root.validation"
import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger"
import { CreateTagRequestDto } from "./dto/tag.dto"
import { TagService } from "./tag.service"
import {
  CreateTagRequest,
  CreateTagRequestType,
  CreateTagResponseType,
  GetAllTagQueryRequest,
  GetAllTagQueryRequestType,
  GetAllTagResponseType
} from "./tag.validation"

@ApiBearerAuth("JWT-auth")
@ApiTags("Tag")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequireRole([Role.STAFF])
  @ApiOperation({ summary: "Create new tags | Require Role: Staff" })
  @ApiBody({
    type: [CreateTagRequestDto],
    description: "Array of tag objects to create. Each object should contain a 'name' property."
  })
  @ApiOkResponse({
    description:
      "Created 3 new tag(s)  | Created 2 new tag(s). Tags with names 'healthy' already exist | Created 2 new tag(s) and restored 1 deleted tag(s) | Restored 1 deleted tag(s)"
  })
  @ApiBadRequestResponse({
    description: "No new tags to create. Tags with names 'healthy' already exist"
  })
  async create(
    @Body(new ZodValidationPipe(CreateTagRequest)) data: CreateTagRequestType
  ): Promise<CreateTagResponseType> {
    const response = await this.tagService.create(data)
    return responses.response200OK(response.messageDetail, response.data)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all tags" })
  @ApiQuery({ name: "page_index", required: false, type: Number, description: "Page index, default is 1" })
  @ApiQuery({ name: "page_size", required: false, type: Number, description: "Page size, default is 10" })
  @ApiQuery({ name: "keyword", required: false, type: String, description: "Search keyword for filtering tag" })
  async findAll(
    @Query(new ZodValidationPipe(GetAllTagQueryRequest)) query: GetAllTagQueryRequestType
  ): Promise<GetAllTagResponseType> {
    const { page_index = 1, page_size = 10, keyword } = query
    const response = await this.tagService.findAll(page_index, page_size, keyword)
    return responses.response200OK(response.messageDetail, response.data)
  }

  @Patch()
  @RequireRole([Role.STAFF])
  @ApiOperation({ summary: "Soft delete multiple tags | Require Role: Staff" })
  @ApiBody({
    type: [String],
    description: "Array of tag IDs to soft delete. Tags will be marked as deleted but not removed from the database."
  })
  async remove(
    @Body(new ZodValidationPipe(ArrayOfUUIDsRequest)) ids: ArrayOfUUIDsRequestType
  ): Promise<BaseResponseNoDataType> {
    const response = await this.tagService.remove(ids)
    return responses.response200OK(response)
  }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.tagService.findOne(+id)
  // }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateTagDto: UpdateTagDto) {
  //   return this.tagService.update(+id, updateTagDto)
  // }
}
