import { Pagination } from "@/constants/types"
import responses from "@/helpers/responses"
import { calculatePagination, removeVietnameseTones, toTitleCase } from "@/helpers/utils"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Like, Repository } from "typeorm"
import { UpdateTagDto } from "./dto/tag.dto"
import { Tag } from "./entities/tag.entity"
import { CreateTagRequestType } from "./tag.validation"

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private readonly tagRepository: Repository<Tag>) {}

  async create(createTagDtos: CreateTagRequestType): Promise<{ messageDetail: string; data: Tag[] }> {
    // Chuẩn hóa input về Title Case
    const normalizedTagDtos = createTagDtos.map((dto) => ({
      name: toTitleCase(dto.name)
    }))

    // Tạo Map để loại bỏ các tag trùng lặp
    const uniqueTagMap = new Map<string, { name: string }>()
    normalizedTagDtos.forEach((dto) => {
      uniqueTagMap.set(dto.name, dto)
    })

    const uniqueTagDtos = Array.from(uniqueTagMap.values())
    const uniqueTagNames = uniqueTagDtos.map((dto) => dto.name)

    // Tìm tất cả tag (kể cả đã xóa) với tên trùng khớp
    const existingTags = await this.tagRepository.find({
      where: uniqueTagNames.map((name) => ({ name })),
      withDeleted: true // Include soft-deleted tags
    })

    // Tách thành 2 danh sách: tags bình thường và tags đã xóa giả
    const activeExistingTags = existingTags.filter((tag) => !tag.isDeleted)
    const deletedExistingTags = existingTags.filter((tag) => tag.isDeleted)

    const activeExistingTagNames = activeExistingTags.map((tag) => tag.name)
    const deletedExistingTagNames = deletedExistingTags.map((tag) => tag.name)

    // Danh sách tags cần tạo mới (không có trong cả 2 danh sách trên)
    const newTagDtos = uniqueTagDtos.filter(
      (dto) => !activeExistingTagNames.includes(dto.name) && !deletedExistingTagNames.includes(dto.name)
    )

    // Khôi phục các tag đã xóa giả
    const restoredTags: Tag[] = []
    for (const deletedTag of deletedExistingTags) {
      deletedTag.isDeleted = false
      const savedTag = await this.tagRepository.save(deletedTag)
      restoredTags.push(savedTag)
    }

    // Tạo các tag hoàn toàn mới
    const createdTags: Tag[] = []
    for (const createTagDto of newTagDtos) {
      const tag = this.tagRepository.create({ name: createTagDto.name })
      const savedTag = await this.tagRepository.save(tag)
      createdTags.push(savedTag)
    }

    // Tổng hợp các tag đã xử lý
    const processedTags = [...createdTags, ...restoredTags]

    if (processedTags.length === 0) {
      const messageDetail = `No new tags to create. Tags with names '${activeExistingTagNames.join(", ")}' already exist`
      throw responses.response400BadRequest(messageDetail, activeExistingTags)
    }

    // Tạo message phù hợp
    let messageDetail = ""
    if (createdTags.length > 0 && restoredTags.length > 0) {
      messageDetail = `Created ${createdTags.length} new tag(s) and restored ${restoredTags.length} deleted tag(s)`
    } else if (createdTags.length > 0) {
      messageDetail = `Created ${createdTags.length} new tag(s)`
    } else if (restoredTags.length > 0) {
      messageDetail = `Restored ${restoredTags.length} deleted tag(s)`
    }

    if (activeExistingTagNames.length > 0) {
      messageDetail += `. Tags with names '${activeExistingTagNames.join(", ")}' already exist`
    }

    return { messageDetail, data: processedTags }
  }

  async findAll(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Promise<{
    messageDetail: string
    data: {
      data: Tag[]
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

    const [courses, count] = await this.tagRepository.findAndCount({
      where: whereCondition,
      take: pageSize,
      skip: (pageIndex - 1) * pageSize
    })

    const pagination = calculatePagination(count, pageSize, pageIndex)

    return {
      messageDetail: "Retrieved all tags successfully",
      data: {
        data: courses,
        pagination
      }
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`
  }

  async remove(ids: string[]): Promise<string> {
    if (!ids || ids.length === 0) {
      throw responses.response400BadRequest("No tag Ids provided", [])
    }

    // Find the tags to delete
    const tagsToDelete = await this.tagRepository.find({
      where: ids.map((id) => ({ id })),
      withDeleted: false // Only target non-deleted tags
    })

    if (tagsToDelete.length === 0) {
      throw responses.response404NotFound(`No tags found with the provided Ids: ${ids.join(", ")}`, null)
    }

    // Mark tags as deleted
    const softDeletePromises = tagsToDelete.map((tag) => {
      tag.isDeleted = true
      return this.tagRepository.save(tag)
    })

    await Promise.all(softDeletePromises)

    // Create appropriate message
    let messageDetail = `Successfully soft-deleted ${tagsToDelete.length} tag(s)`

    // Return tags that were found but not all requested IDs were found
    const notFoundIds = ids.filter((id) => !tagsToDelete.map((tag) => tag.id).includes(id))

    if (notFoundIds.length > 0) {
      messageDetail += `. Could not find tags with IDs: ${notFoundIds.join(", ")}`
    }

    return messageDetail
  }

  async findTagByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      throw responses.response400BadRequest("No tag Ids provided", [])
    }

    // Find the tags by IDs
    const tags = await this.tagRepository.find({
      where: ids.map((id) => ({ id })),
      withDeleted: false // Only target non-deleted tags
    })

    return tags
  }
}
