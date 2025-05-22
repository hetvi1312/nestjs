import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/common/entities/user.entity';
import { jwtStrategy } from 'src/common/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Posts } from 'src/common/entities/post.entity';
import { Uploads } from 'src/common/entities/upload.entiity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'topSecret51',
      signOptions: { expiresIn: '365d' },
    }),
    TypeOrmModule.forFeature([User,Posts,Uploads])],
  providers: [UsersService,jwtStrategy],
  controllers: [UsersController],
  exports: [UsersService,TypeOrmModule, jwtStrategy],
})
export class UsersModule {}
