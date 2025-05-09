import { Injectable } from '@nestjs/common';
import { CreateCommentDto, SortingCommentDto, UpdateCommentDto } from '../common/dto/comment.dto';
import { checkIdOrNull, getCommonResponse } from 'src/common/function/common-response.util';
import { Comments } from 'src/common/entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { Posts } from 'src/common/entities/post.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetAll } from 'src/common/enum/pagination.enum';


@Injectable()
export class CommentService {
  constructor(
        @InjectRepository(Comments) private commentRepository: Repository<Comments>,
        @InjectRepository(Posts) private postRepository: Repository<Posts>
      ) {}
      async create(createCommentDto: CreateCommentDto, user: User) {
        try {
          const { post_id, comment } = createCommentDto;
      
          let post: Posts | undefined = undefined;
          if (post_id) {
            const postEntity = await this.postRepository.findOne({ where: { id: post_id } });
            if (!postEntity) {
              return getCommonResponse(404, 'Post not found', '');
            }
            post = postEntity;
          }
      
          const newComment = this.commentRepository.create({
            comment,
            user,
            post 
          });
      
          const savedComment = await this.commentRepository.save(newComment);
      
          const fullComment = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: { user: true, post: true }
          });
      
          return getCommonResponse(200, 'Success', new Comments(fullComment));
        } catch (error) {
          console.error('Error creating comment:', error);
          return error;
        }
      }
      
      
  async findAll(paginationDto: PaginationDto, sortingCommentDto: SortingCommentDto) {
        try {
            const { getall, limit, offset, search } = paginationDto;
            const query = this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.post', 'post')
            .leftJoinAndSelect('comment.user', 'user');
            const { orderByColumn, order } = sortingCommentDto;
        if (search) {
            let optimizedSearch = search
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                .replace(/\s+(?!\s*$)/g, '|');
            query.andWhere(`comment.comment REGEXP :keyword`, { keyword: optimizedSearch });
        }
        if (getall == GetAll.NO) {
            query.skip(offset * limit).take(limit);
        }
        const total_records = await query.clone().getCount();
        if (orderByColumn && order) {
            query.orderBy(`comment.${orderByColumn}`, order)
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
      const comment = await this.commentRepository.findOne({ where: { id },relations: { post: true,user:true}});
      if (!comment) {
        return getCommonResponse(404, `Not found.`, '');
      }
      return getCommonResponse(200, 'Record fetch successfully', new Comments(comment));
    } catch (error) {
      console.error('Error finding user by ID', { error });
      throw error;
    }
  }
  async update(id: number, updateCommentDto: UpdateCommentDto, user: User) {
    try {
      const { post_id, comment } = updateCommentDto;
  
      // Find the existing comment with its author
      const existingComment = await this.commentRepository.findOne({
        where: { id },
        relations: { user: true, post: true }
      });
  
      if (!existingComment) {
        return getCommonResponse(404, 'Comment not found', '');
      }
  
      // Check if the logged-in user is the author
      if (!user || !user.id || existingComment.user.id !== user.id) {
        return getCommonResponse(403, 'You cannot update this comment because you did not write it.', '');
      }
  
      // If post_id is provided, validate the post
      let post: Posts | undefined = undefined;
      if (post_id) {
        const postEntity = await this.postRepository.findOne({ where: { id: post_id } });
        if (!postEntity) {
          return getCommonResponse(404, 'Post not found', '');
        }
        post = postEntity;
      }
  
      // Update comment fields
      existingComment.comment = comment ?? existingComment.comment;
      existingComment.post = post ?? existingComment.post;
  
      const updatedComment = await this.commentRepository.save(existingComment);
  
      const fullComment = await this.commentRepository.findOne({
        where: { id: updatedComment.id },
        relations: { user: true, post: true }
      });
  
      return getCommonResponse(200, 'Comment updated successfully', fullComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      return error;
    }
  }
  
  

  async remove(id: number) {
    try {
      const comment = await this.commentRepository.findOne({ where: { id }});
      if (!comment) {
        return getCommonResponse(404, `post not found`, '');
      }
      await this.commentRepository.remove(comment);
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
