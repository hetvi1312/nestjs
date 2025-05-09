import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Posts } from 'src/common/entities/post.entity';
import { Uploads } from 'src/common/entities/upload.entiity';


@Module({
  imports: [TypeOrmModule.forFeature([Posts, User,Uploads])],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
