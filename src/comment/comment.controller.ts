import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, SortingCommentDto, UpdateCommentDto } from '../common/dto/comment.dto';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto,@GetUser() user:User) {
    return this.commentService.create(createCommentDto,user);
  }

  @Get()
     findAll(@Query() paginationDto: PaginationDto, @Query() sortingCommentDto: SortingCommentDto) {
      return this.commentService.findAll(paginationDto, sortingCommentDto);
     }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto,@GetUser() user:User) {
    return this.commentService.update(id, updateCommentDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.commentService.remove(id);
  }
}
