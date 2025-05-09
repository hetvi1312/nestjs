import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Posts } from 'src/common/entities/post.entity';
import { Comments } from 'src/common/entities/comment.entity';
import { Uploads } from 'src/common/entities/upload.entiity';

@Module({
  imports: [TypeOrmModule.forFeature([Comments,Posts,User,Uploads])],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
