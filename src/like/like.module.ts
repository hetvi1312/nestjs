import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/common/entities/post.entity';
import { User } from 'src/common/entities/user.entity';
import { Likes } from 'src/common/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Likes, Posts, User])],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
