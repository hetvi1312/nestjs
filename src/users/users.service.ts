import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, SortingUserDto, UpdateUserDto } from '../common/dto/users.dto';
import { getCommonResponse } from 'src/common/function/common-response.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { jwtPayload } from 'src/common/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { GetAll } from 'src/common/enum/pagination.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { username, email, password } = createUserDto;
  
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
  
      if (existingUser) {
        return getCommonResponse(
          400,
          `The email already exists. Please choose a different email.`,
          ''
        );
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userToSave = this.usersRepository.create({
        username,
        email,
        password: hashedPassword,
      });
  
      const savedUser = await this.usersRepository.save(userToSave);
  
      return getCommonResponse(200, 'Success', new User(savedUser));
    } catch (error) {
      console.error('Error in create():', error);
      return error;
    }
  }
  
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const useremail = await this.usersRepository.findOne({ where: { email } });
      if (!useremail) {
        throw new UnauthorizedException('Invalid email');
      }

      const pass = await bcrypt.compare(password, useremail.password);

      if (pass) {
        const payload: jwtPayload = { email };
        const accessToken: string = this.jwtService.sign(payload);

        const userDetails = await this.usersRepository.findOne({ where: { id: useremail.id } });

        return getCommonResponse(200, 'Login successful', { accessToken, user: new User(userDetails) });
      } else {
        throw new UnauthorizedException('Invalid email or password');
      }
    } catch (error) {
      console.error('Error login user:', error);
      throw error;
    }
  }
  async findAll(paginationDto: PaginationDto, sortingUserDto: SortingUserDto) {
    try {
      const { getall, limit, offset, search } = paginationDto;

      const query = this.usersRepository.createQueryBuilder('user')
      
      const { orderByColumn, order } = sortingUserDto;

      if (search) {
        let optimizedSearch = search
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          .replace(/\s+(?!\s*$)/g, '|');
        query.andWhere(`(user.email REGEXP :keyword
                          OR user.username REGEXP :keyword)`, { keyword: optimizedSearch });
      }

      if (getall == GetAll.NO) {
        query.skip(offset * limit).take(limit);
      }

      const total_records = await query.clone().getCount();

      if (orderByColumn && order) {
        query.orderBy(`user.${orderByColumn}`, order)
      }

      const findAllData = await query.getMany();

      if (findAllData.length) {
        return getCommonResponse(200, 'Record fetch successfully', new User(findAllData), total_records);
      } else {
        return getCommonResponse(404, 'Not found', '');
      }
    } catch (error) {
      console.error('Error fetching user', { error });
      throw error;
    }
  }


  async findOne(id: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { id }});
      if (!user) {
        return getCommonResponse(404, `Not found.`, '');
      }
      return getCommonResponse(200, 'Record fetch successfully', new User(user));
    } catch (error) {
      console.error('Error finding user by ID', { error });
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const { email } = updateUserDto;
      const existingUser = await this.usersRepository.findOne({ where: { id } });
      if (!existingUser) {
        return getCommonResponse(404, `Not found.`, '');
      }
      if (email) {
        const emailExists = await this.usersRepository.findOne({
          where: { email, id: Not(id) },
        });
        if (email && emailExists) {
          return getCommonResponse(400, `The email is already available. Please choose a different email.`, '');
        }
      }
      const updateUser = await this.usersRepository.update(id, {
      ...updateUserDto
      });

      if (updateUser) {
        const updatedUser = await this.usersRepository.findOne({ where: { id } });

        return getCommonResponse(200, 'Record updated successfully', new User(updatedUser));
      }
      else {
        return getCommonResponse(502, 'Something went wrong please try again later', '');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const userId = await this.usersRepository.findOne({ where: { id }});
      if (!userId) {
        return getCommonResponse(404, `User id not found`, '');
      }
      await this.usersRepository.remove(userId);
      return getCommonResponse(200, 'Record removed successfully', '');
    } catch (error) {
      console.error('Error removing user', { error });
      // Catch DB constraint errors and return a user-friendly message
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return getCommonResponse(400, 'Cannot delete this record because it is referenced by other records. Please ensure there are no related records before attempting to delete.', '');
      }
      return getCommonResponse(500, 'An unexpected error occurred.', '');
    }
  }
}
