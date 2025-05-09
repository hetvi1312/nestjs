import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, SortingUserDto, UpdateUserDto } from '../common/dto/users.dto';
import { User } from 'src/common/entities/user.entity';
import { GetUser } from 'src/common/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query() sortingUserDto: SortingUserDto) {
    return this.usersService.findAll(paginationDto, sortingUserDto);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
