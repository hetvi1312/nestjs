import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, SortingPostsDto, UpdatePostDto } from '../common/dto/post.dto';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto,@GetUser() user:User) {
    return this.postService.create(createPostDto,user);
  }

  @Get()
   findAll(@Query() paginationDto: PaginationDto, @Query() sortingPostsDto: SortingPostsDto) {
     return this.postService.findAll(paginationDto, sortingPostsDto);
   }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto,@GetUser() user:User) {
    return this.postService.update(+id, updatePostDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postService.remove(id);
  }
}
