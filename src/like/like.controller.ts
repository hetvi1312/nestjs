import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto, SortingLikeDto, UpdateLikeDto } from '../common/dto/like.dto';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortingPostsDto } from 'src/common/dto/post.dto';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  create(@Body() createLikeDto: CreateLikeDto,@GetUser() user:User) {
    return this.likeService.toggleLike(createLikeDto,user);
  }
  
  @Get()
    findAll(@Query() paginationDto: PaginationDto, @Query() sortingLikeDto: SortingLikeDto) {
      return this.likeService.findAll(paginationDto, sortingLikeDto);
    }

    @Get('likes')
    async getUsers(@Query('page') page = 1,@Query('limit') limit = 20,) {
      return this.likeService.getPaginatedUsers(Number(page), Number(limit));
    }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.likeService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.likeService.remove(id);
  }
}
