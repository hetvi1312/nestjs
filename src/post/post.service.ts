import { Injectable } from '@nestjs/common';
import { CreatePostDto, SortingPostsDto, UpdatePostDto } from '../common/dto/post.dto';
import { checkIdOrNull, getCommonResponse } from 'src/common/function/common-response.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/common/entities/post.entity';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { Uploads } from 'src/common/entities/upload.entiity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetAll } from 'src/common/enum/pagination.enum';


@Injectable()
export class PostService {

  constructor(
      @InjectRepository(Posts) private postRepository: Repository<Posts>,
      @InjectRepository(Uploads) private uploadRepository: Repository<Uploads>,

    ) {}

  async create(createPostDto: CreatePostDto,user:User) {
      try {
        const { caption, upload_id } = createPostDto;
        const upload = upload_id && await this.uploadRepository.findOne({ where: { upload_id: upload_id } });
        if (upload_id && !upload) {
          return getCommonResponse(404, `Upload with id  not found`, '');
        }
  
        let posts;
        posts= this.postRepository.create({
          ...createPostDto,
          user:user
        });
        posts.upload = checkIdOrNull(upload_id) ? upload_id : posts.upload;

        
        const savedPost = await this.postRepository.save(posts);
  
        if(savedPost){
          const newPost = await this.postRepository.findOne({ where: { id: savedPost.id }, relations: { upload: true,user:true} });
        
          return getCommonResponse(200, "Success", new Posts(newPost));
        } else {
          return getCommonResponse(502, 'Something went wrong please try again later', '')
        }
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

  async findAll(paginationDto: PaginationDto, sortingPostsDto: SortingPostsDto) {
      try {
          const { getall, limit, offset, search } = paginationDto;
          const query = this.postRepository.createQueryBuilder('post')
          .leftJoinAndSelect('post.upload', 'upload')
          .leftJoinAndSelect('post.user', 'user')
          .leftJoinAndSelect('post.likes', 'like')
          // .leftJoinAndSelect('like.user', 'likeUser');
          const { orderByColumn, order } = sortingPostsDto;
      if (search) {
          let optimizedSearch = search
              .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
              .replace(/\s+(?!\s*$)/g, '|');
          query.andWhere(`post.caption REGEXP :keyword`, { keyword: optimizedSearch });
      }
      if (getall == GetAll.NO) {
          query.skip(offset * limit).take(limit);
      }
      const total_records = await query.clone().getCount();
      if (orderByColumn && order) {
          query.orderBy(`post.${orderByColumn}`, order)
      }
      const findAllData = await query.getMany();
      if (findAllData.length) {
          return getCommonResponse(200, 'Record fetch successfully', findAllData.map(u => new Posts(u)), total_records);
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
      const postid = await this.postRepository.findOne({ where: { id },relations: { upload: true,user:true}});
      if (!postid) {
        return getCommonResponse(404, `Not found.`, '');
      }
      return getCommonResponse(200, 'Record fetch successfully', new User(postid));
    } catch (error) {
      console.error('Error finding user by ID', { error });
      throw error;
    }
  }
  async update(id: number, updatePostDto: UpdatePostDto, user: User) {
    try {
      const { caption,upload_id,likesEnabled } = updatePostDto;
  
      // Find the existing comment with its author
      const existingPost = await this.postRepository.findOne({
        where: { id },
        relations: { user: true, upload: true }
      });
  
      if (!existingPost) {
        return getCommonResponse(404, 'post not found', '');
      }
  
      // Check if the logged-in user is the author
      // if (!user || !user.id || existingComment.user.id !== user.id) {
      //   return getCommonResponse(403, 'You cannot update this comment because you did not write it.', '');
      // }
  
      // If post_id is provided, validate the post
      let upload: Uploads | undefined = undefined;
      if (upload_id) {
        const postEntity = await this.uploadRepository.findOne({ where: { upload_id: upload_id } });
        if (!postEntity) {
          return getCommonResponse(404, 'Post not found', '');
        }
        upload = postEntity;
      }
  
      // Update comment fields
      existingPost.caption = caption ?? existingPost.caption;
      existingPost.upload = upload ?? existingPost.upload;
      existingPost.likesEnabled = likesEnabled ?? existingPost.likesEnabled;
  
      const updatedPost = await this.postRepository.save(existingPost);
  
      const fullPost = await this.postRepository.findOne({
        where: { id: updatedPost.id },
        relations: { user: true, upload: true }
      });
  
      return getCommonResponse(200, 'Post updated successfully', new Posts(fullPost));
    } catch (error) {
      console.error('Error updating comment:', error);
      return error;
    }
  }
  
  
  async remove(id: number) {
    try {
      const postId = await this.postRepository.findOne({ where: { id }});
      if (!postId) {
        return getCommonResponse(404, `post not found`, '');
      }
      await this.postRepository.remove(postId);
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
