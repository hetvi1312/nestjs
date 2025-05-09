import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { jwtPayload } from "./jwt-payload.interface";
@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy){
     constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
      ) { 
        super({
            secretOrKey:'topSecret51',
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
      }
      async validate(payload: jwtPayload): Promise<User> {
        const{ email }= payload;
        const user: User | null = await this.usersRepository.findOne({ where: { email } });

        if(!user){
            throw new UnauthorizedException();
        }
        return user;
    }
}