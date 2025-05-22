import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, SortingUserDto, UpdateUserDto } from '../common/dto/users.dto';
import { getCommonResponse } from 'src/common/function/common-response.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { In, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { jwtPayload } from 'src/common/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { GetAll } from 'src/common/enum/pagination.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Posts } from 'src/common/entities/post.entity';
import { Uploads } from 'src/common/entities/upload.entiity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Posts) private postsRepository: Repository<Posts>,
     @InjectRepository(Uploads) private uploadsRepository: Repository<Uploads>,
    private jwtService: JwtService,
  ) {}

async createV2(createUserDto: CreateUserDto) {
    try {
      const { username, email, password } = createUserDto;
  
      // const existingUser = await this.usersRepository.findOne({
      //   where: { email },
      // });
  
      // if (existingUser) {
      //   return getCommonResponse(
      //     400,
      //     `The email already exists. Please choose a different email.`,
      //     ''
      //   );
      // }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userToSave = this.usersRepository.upsert({
        username,
        email,
        password: hashedPassword,
      },['email']);
      
    if(userToSave){
      return getCommonResponse(200, 'Success', userToSave);
    }
      else{
      return getCommonResponse(404, 'something went to wrong', userToSave);
      }
    } catch (error) {
      console.error('Error in create():', error);
      return error;
    }
  }
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
      const user = await this.usersRepository.exists({where:{ id }});
      console.log(user);
      
      if (!user) {
        return getCommonResponse(404, `Not found.`, '');
      }
      console.log(user);
      // const userid = await this.usersRepository.existsBy({username:'hetvi'}); 

      return getCommonResponse(200, 'Record fetch successfully', user);
    } catch (error) {
      console.error('Error finding user by ID', { error });
      throw error;
    }
  }

async update(id: number, updateUserDto: UpdateUserDto) {
  try {
    const { email, posts } = updateUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts', 'likes', 'comments'],
    });

    if (!existingUser) {
      return getCommonResponse(404, 'User not found.', '');
    }

    if (email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email, id: Not(id) },
      });

      if (emailExists) {
        return getCommonResponse(400, 'Email already in use.', '');
      }
    }

    const updatedPosts = posts ? await Promise.all(
      posts.map(async (postDto) => {
    let uploadEntity: Uploads | null | undefined = undefined;

        // check if upload_id is provided
        if (postDto.upload_id) {
          uploadEntity = await this.uploadsRepository.findOne({
            where: { upload_id: postDto.upload_id },
          });

          if (!uploadEntity) {
            throw new Error(`Upload with id ${postDto.upload_id} not found.`);
          }
        }

        const postData: any = {
          ...postDto,
          user: existingUser,
        };

        // only set upload if found
        if (uploadEntity) {
          postData.upload = uploadEntity;
        }

        if (postDto.id) {
          const preloadPost = await this.postsRepository.preload(postData);
          return preloadPost ?? this.postsRepository.create(postData);
        }

        return this.postsRepository.create(postData);
      })
    ) : [];

    const userToUpdate = await this.usersRepository.preload({
      id,
      ...updateUserDto,
      posts,
    });

    if (!userToUpdate) {
      return getCommonResponse(404, 'User not found on preload.', '');
    }

    const savedUser = await this.usersRepository.save(userToUpdate);
    return getCommonResponse(200, 'User updated successfully.', new User(savedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    return getCommonResponse(500, 'Internal server error', error.message);
  }
}


  //   async updateUser(userId: number, updateUserDto: UpdateUserDto) {
  //   // Step 1: Find the user by ID
  //   const user = await this.usersRepository.findOne({
  //     where: { id: userId },
  //     relations: ['posts', 'posts.upload'], // Ensure upload is loaded
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Step 2: Update user fields if provided
  //   if (updateUserDto.username) user.username = updateUserDto.username;
  //   if (updateUserDto.email) user.email = updateUserDto.email;

  //   // Handle post updates or creation
  //   let updatedPostDetails : Posts[] = []; // Store the updated posts

  //   if (updateUserDto.posts && updateUserDto.posts.length > 0) {
  //     updatedPostDetails = await Promise.all(
  //       updateUserDto.posts.map(async (postDto) => {
  //         let upload: Uploads | undefined = undefined;

  //         if (postDto.upload_id) {
  //           const foundUpload = await this.uploadsRepository.findOne({
  //             where: { upload_id: postDto.upload_id },
  //           });

  //           if (!foundUpload) {
  //             throw new NotFoundException(`Upload with ID ${postDto.upload_id} not found`);
  //           }

  //           upload = foundUpload;
  //         }

  //         if (postDto.id) {
  //           const post = await this.postsRepository.findOne({
  //             where: { id: postDto.id },
  //             relations: ['user', 'upload'],
  //           });

  //           if (!post || post.user.id !== userId) {
  //             throw new ForbiddenException(`You are not allowed to update post with ID ${postDto.id}`);
  //           }

  //           const existingPost = await this.postsRepository.preload({
  //             id: postDto.id,
  //             ...postDto,
  //             user,
  //             upload,
  //           });

  //           if (!existingPost) {
  //             throw new NotFoundException(`Post with ID ${postDto.id} not found`);
  //           }

  //           return existingPost; // Updated post
  //         } else {
  //           // Create new post
  //           return this.postsRepository.create({
  //             ...postDto,
  //             user,
  //             upload,
  //           });
  //         }
  //       })
  //     );

  //     // Save the new or updated posts
  //     await this.postsRepository.save(updatedPostDetails);
  //   }

  //   // Step 3: Save updated user
  //   const updatedUser = await this.usersRepository.save(user);

  //   // Step 4: Return the response with updated user details and posts
  //   const updatedUserDetails = new User(updatedUser); // Using the constructor to create a User instance

  //   return {
  //     status: '200',
  //     message: 'User updated successfully.',
  //     data: {
  //       ...updatedUserDetails, // Return updated user with posts
  //       posts: updatedPostDetails, // Only return updated posts
  //     },
  //   };
  // }
async updateUser(id: number, updateUserDto: UpdateUserDto) {
  const { email, username, posts } = updateUserDto;

  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    return getCommonResponse(400, 'User not found', '');
  }

  if (email) {
    const emailExists = await this.usersRepository.findOne({
      where: { email, id: Not(id) },
    });

    if (emailExists) {
      return getCommonResponse(400, 'Email already in use.', '');
    }
  }

  let updatedPosts: Posts[] = [];

  if (posts && posts.length > 0) {
    for (const postDto of posts) {
      let upload: Uploads | undefined;

      if (postDto.upload_id) {
        const foundUpload = await this.uploadsRepository.findOne({
          where: { upload_id: postDto.upload_id },
        });

        if (!foundUpload) {
          throw new NotFoundException(`Upload with ID ${postDto.upload_id} not found`);
        }

        upload = foundUpload;
      }

      let updatedPost: Posts;

      if (postDto.id) {
        const existingPost = await this.postsRepository.findOne({
          where: { id: postDto.id },
          relations: { user: true },
        });

        if (!existingPost || existingPost.user.id !== id) {
          throw new ForbiddenException(`You are not allowed to update post with ID ${postDto.id}`);
        }

        const preloadPost = await this.postsRepository.preload({
          id: postDto.id,
          ...postDto,
          upload,
        });

        if (!preloadPost) {
          throw new NotFoundException(`Post with ID ${postDto.id} not found`);
        }

        // Use full user object
        preloadPost.user = user;
        updatedPost = preloadPost;
      } else {
        updatedPost = this.postsRepository.create({
          ...postDto,
          user,
          upload,
        });
      }

      updatedPosts.push(updatedPost);
    }

    await this.postsRepository.save(updatedPosts);
  }

  const updatedUserData = await this.usersRepository.preload({
    id,
    username: username || user.username,
    email: email || user.email,
    // posts: updatedPosts, 
  });

  if (!updatedUserData) {
    return getCommonResponse(400, 'User not found during update', '');
  }

  const savedUser = await this.usersRepository.save(updatedUserData);

  const userWithoutPosts = await this.usersRepository.findOne({ where: { id: savedUser.id } });

  const updatedPostIds = updatedPosts.map((p) => p.id).filter(Boolean);
  const updatedPostDetails = updatedPostIds.length > 0
    ? await this.postsRepository.find({
        where: { id: In(updatedPostIds) },
        relations: { upload: true, user: true },
      })
    : [];

  return getCommonResponse(200, 'User updated successfully.', {
    ...userWithoutPosts,
    posts: updatedPostDetails,
  });
}


// async updateUser(id: number, updateUserDto: UpdateUserDto) {
//   const user = await this.usersRepository.findOne({
//     where: { id: id },
//     relations: { posts: true },
//   });

//   if (!user) {
//     return getCommonResponse(400, 'User not found', '');
//   }

//   // Use preload to update user fields (username and email)
//   const updatedUserData = await this.usersRepository.preload({
//     id: user.id,
//     username: updateUserDto.username || user.username,  // Use new value or existing if not provided
//     email: updateUserDto.email || user.email,  // Use new value or existing if not provided
//   });

//   if (!updatedUserData) {
//     return getCommonResponse(400, 'User data is invalid or could not be updated', '');
//   }

//   let updatedPosts: Posts[] = [];

//   // Handle post updates or creation
//   if (updateUserDto.posts && updateUserDto.posts.length > 0) {
//     updatedPosts = await Promise.all(
//       updateUserDto.posts.map(async (postDto) => {
//         let upload: Uploads | undefined = undefined;

//         // Handle upload ID if provided
//         if (postDto.upload_id) {
//           const foundUpload = await this.uploadsRepository.findOne({
//             where: { upload_id: postDto.upload_id },
//           });

//           if (!foundUpload) {
//             throw new NotFoundException(`Upload with ID ${postDto.upload_id} not found`);
//           }

//           upload = foundUpload;
//         }

//         if (postDto.id) {
//           // Updating an existing post
//           const post = await this.postsRepository.findOne({
//             where: { id: postDto.id },
//             relations: { user: true, upload: true },
//           });

//           if (!post || post.user.id !== id) {
//             throw new ForbiddenException(`You are not allowed to update post with ID ${postDto.id}`);
//           }

//           const existingPost = await this.postsRepository.preload({
//             id: postDto.id,
//             ...postDto,
//             user: { id: updatedUserData.id },  // Ensure the user is linked
//             upload,  // Include upload if it exists
//           });

//           if (!existingPost) {
//             throw new NotFoundException(`Post with ID ${postDto.id} not found`);
//           }

//           return existingPost;
//         } else {
//           // Creating a new post, ensure the user is linked
//           const newPost = this.postsRepository.create({
//             ...postDto,
//             user: updatedUserData,  // Explicitly link the updated user here
//             upload,  // Include upload if it exists
//           });

//           return newPost;
//         }
//       })
//     );

//     // Save posts to the repository
//     await this.postsRepository.save(updatedPosts);
//   }

//   // Save updated user
//   const savedUser = await this.usersRepository.save(updatedUserData);

//   // Fetch user without posts
//   const userWithoutPosts = await this.usersRepository.findOne({ where: { id: savedUser.id } });

//   // Get updated posts with upload info
//   const updatedPostIds = updatedPosts.map((p) => p.id);
//   const updatedPostDetails = await this.postsRepository.find({
//     where: { id: In(updatedPostIds) },
//     relations: { upload: true, user: true },
//   });

//   // Return a successful response with user and posts
//   return getCommonResponse(200, 'User updated successfully.', { ...userWithoutPosts, posts: updatedPostDetails });
// }

  async removeid(id: number) {
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

  //use a softdelete method 
  async remove(id: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
  
      if (!user) {
        return getCommonResponse(404, `User id not found`, '');
      }
  
      await this.usersRepository.softRemove(user);
  
      return getCommonResponse(200, 'Record soft-deleted successfully', '');
    } catch (error) {
      console.error('Error soft-deleting user', { error });
  
      // Optional: handle specific DB constraint errors if needed
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return getCommonResponse(
          400,
          'Cannot delete this record because it is referenced by other records. Please ensure there are no related records before attempting to delete.',
          ''
        );
      }
  
      return getCommonResponse(500, 'An unexpected error occurred.', '');
    }
  }
  async restore(id: number) {
    try {
      await this.usersRepository.restore(id);
      return getCommonResponse(200, 'Record restored successfully', '');
    } catch (error) {
      console.error('Error restoring user', { error });
      return getCommonResponse(500, 'An unexpected error occurred.', '');
    }
  }
    
}
