import { Module } from '@nestjs/common';
import { RecipeTagService } from './recipe-tag.service';
import { RecipeTagController } from './recipe-tag.controller';

@Module({
  controllers: [RecipeTagController],
  providers: [RecipeTagService],
})
export class RecipeTagModule {}
