import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common"
import { RecipeTagService } from "./recipe-tag.service"

@Controller("recipe-tag")
export class RecipeTagController {
  constructor(private readonly recipeTagService: RecipeTagService) {}
}
