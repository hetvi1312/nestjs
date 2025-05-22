import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, SortingUserDto, UpdateUserDto } from '../common/dto/users.dto';
import { User } from 'src/common/entities/user.entity';
import { GetUser } from 'src/common/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('v2')
  createV2(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createV2(createUserDto);
  }


  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query() sortingUserDto: SortingUserDto) {
    return this.usersService.findAll(paginationDto, sortingUserDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }
  @Post('restore/:id')
  async restore(@Param('id') id: number) {
    return this.usersService.restore(id);
  }
  @Delete('softdeletd/:id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @Patch('preload/:id')
  updatePost(@Param('id',ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usersService.removeid(id);
  }

}
