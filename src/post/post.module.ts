import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Posts } from 'src/common/entities/post.entity';
import { Uploads } from 'src/common/entities/upload.entiity';
import { Likes } from 'src/common/entities/like.entity';
import { Comments } from 'src/common/entities/comment.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Posts, User,Uploads,Likes,Comments])],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
