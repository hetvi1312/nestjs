import { Module } from '@nestjs/common';
import { UploadService } from './uploads.service';
import { UploadController } from './uploads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/common/entities/post.entity';
import { User } from 'src/common/entities/user.entity';
import { Uploads } from 'src/common/entities/upload.entiity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, User,Uploads])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
