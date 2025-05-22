import { Injectable } from '@nestjs/common';
import { CreateLikeDto, SortingLikeDto, UpdateLikeDto } from '../common/dto/like.dto';
import { getCommonResponse } from 'src/common/function/common-response.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/common/entities/post.entity';
import { Likes } from 'src/common/entities/like.entity';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { GetAll } from 'src/common/enum/pagination.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class LikeService {
   constructor(
          @InjectRepository(Likes) private likeRepository: Repository<Likes>,
          @InjectRepository(Posts) private postRepository: Repository<Posts>
        ) {}
        async toggleLike(createLikeDto: CreateLikeDto, user: User) {
          try {
            const { post_id } = createLikeDto;
        
            const post = await this.postRepository.findOne({
              where: { id: post_id },
              relations: { likes: true },
            });
        
            if (!post) {
              return getCommonResponse(404, 'Post not found', '');
            }
        
            if (!post.likesEnabled) {
              return getCommonResponse(402, 'Likes are disabled for this post', '');
            }
        
            let existingLike = await this.likeRepository.findOne({
              where: {
                post: { id: post.id },
                user: { id: user.id },
              },
            });
        
            let action = '';
        
            if (existingLike) {
              if (existingLike.isActive) {
                // Unlike: set isActive false and decrement likeCount
                existingLike.isActive = false;
                await this.likeRepository.save(existingLike);
                await this.postRepository.decrement({ id: post.id }, 'likeCount', 1);
                action = 'unliked';
              } else {
                // Re-like: set isActive true and increment likeCount
                existingLike.isActive = true;
                await this.likeRepository.save(existingLike);
                await this.postRepository.increment({ id: post.id }, 'likeCount', 1);
                action = 'liked';
              }
            } else {
              // New like: save and increment
              const newLike = this.likeRepository.create({ post, user, isActive: true });
              await this.likeRepository.save(newLike);
              await this.postRepository.increment({ id: post.id }, 'likeCount', 1);
              action = 'liked';
            }
        
            const updatedPost = await this.postRepository.findOne({
              where: { id: post_id },
              relations: { user: true, likes: true, upload: true, comments: true },
            });
        
            if (!updatedPost) {
              return getCommonResponse(404, 'Post not found after update', '');
            }
        
            return getCommonResponse(200, `Post ${action} successfully`, {
              post: updatedPost,
              likeCount: updatedPost.likeCount,
              likedByUser: action === 'liked',
            });
        
          } catch (error) {
            console.error('Error toggling like:', error);
            return getCommonResponse(500, 'Internal Server Error', error.message);
          }
        }
        
        async getPaginatedUsers(page: number, limit: number) {
          const [users, total] = await this.likeRepository.findAndCount({
            where: { isActive: true },
            skip: (page - 1) * limit, // e.g., page 2 with limit 10 skips 10 users
            take: limit,              // limit per page
            order: { id: 'ASC' },     // optional sorting
          });
          return {
            data: users,
            currentPage: page,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
          };
        }

  async findAll(paginationDto: PaginationDto, sortingLikeDto: SortingLikeDto) {
        try {
            const { getall, limit, offset, search } = paginationDto;
            const query = this.likeRepository.createQueryBuilder('like')
            .leftJoinAndSelect('like.post', 'post')
            .leftJoinAndSelect('like.user', 'user');  
          
            const { orderByColumn, order } = sortingLikeDto;
          if (search) {
            let optimizedSearch = search
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                .replace(/\s+(?!\s*$)/g, '|');
            query.andWhere(`like.isActive REGEXP :keyword`, { keyword: optimizedSearch });
        }
        if (getall == GetAll.NO) {
             query.skip(offset * limit).take(limit);
        }
        const total_records = await query.clone().getCount();
        if (orderByColumn && order) {
            query.orderBy(`like.${orderByColumn}`, order)
        }
        const findAllData = await query.getMany();
        if (findAllData.length) {
            return getCommonResponse(200, 'Record fetch successfully', findAllData.map(u => new Likes(u)), total_records);
        } else {
            return getCommonResponse(404, 'Not found', '');
        }
        } catch (error) {
        console.error('Error fetching user', { error });
        throw error;
        }
    }

    // async findAll(paginationDto: PaginationDto, sortingLikeDto: SortingLikeDto) {
    //   try {
    //     const { getall, limit, offset, search } = paginationDto;
    //     const { orderByColumn, order } = sortingLikeDto;
    
    //     const whereClause: any = {};
    
    //     // You may need to adapt this depending on what field 'search' is for
    //     if (search) {
    //       whereClause.isActive = Like(`%${search}%`);
    //       // Note: REGEXP not supported in findAndCount() directly.
    //     }
    
    //     const options: FindManyOptions<Likes> = {
    //       where: whereClause,
    //       relations: ['post', 'user'],
    //     };
    
    //     if (orderByColumn && order) {
    //       options.order = {
    //         [orderByColumn]: order.toUpperCase(), // 'ASC' | 'DESC'
    //       };
    //     }
    
    //     if (getall == GetAll.NO) {
    //       options.skip = offset * limit;
    //       options.take = limit;
    //     }
    
    //     const [findAllData, total_records] = await this.likeRepository.findAndCount(options);
    
    //     if (findAllData.length) {
    //       return getCommonResponse(
    //         200,
    //         'Record fetch successfully',
    //         findAllData.map((u) => new Likes(u)),
    //         total_records,
    //       );
    //     } else {
    //       return getCommonResponse(404, 'Not found', '');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching user', { error });
    //     throw error;
    //   }
    // }

  async findOne(id: number) {
    try {
      const like = await this.likeRepository.findOne({ where: { id },relations: { post: true,user:true}});
      if (!like) {
        return getCommonResponse(404, `Not found.`, '');
      }
      return getCommonResponse(200, 'Record fetch successfully', new Likes(like));
    } catch (error) {
      console.error('Error finding user by ID', { error });
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const like = await this.likeRepository.findOne({ where: { id }});
      if (!like) {
        return getCommonResponse(404, `like not found`, '');
      }
      await this.likeRepository.remove(like);
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
