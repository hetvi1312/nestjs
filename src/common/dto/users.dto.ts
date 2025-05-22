import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Order, UserEnum } from "../enum/pagination.enum";
import { CreatePostDto } from "./post.dto";
import { Type } from "class-transformer";
import { CreateCommentDto } from "./comment.dto";

export class CreateUserDto {

  id?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    username: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    password: string;
  }
  

  export class LoginDto {
    @ApiProperty({ type: String, required: true })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ type: String, required: true })
    @IsNotEmpty()
    password: string;
}

export class UpdateUserDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ type: [CreatePostDto], required: false }) 
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts?: CreatePostDto[];

  //  @ApiProperty({ type: [CreatePostDto], required: false }) 
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => CreatePostDto)
  // likes?: CreatePostDto[];

  @ApiProperty({ type: [CreateCommentDto], required: false }) 
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentDto)
  comments?: CreateCommentDto[];
}

export class SortingUserDto {
  @ApiPropertyOptional({ default: UserEnum.id, enum: UserEnum })
  @IsEnum(UserEnum)
  @IsOptional()
  orderByColumn: UserEnum = UserEnum.id;

  @ApiPropertyOptional({ default: Order.DESC, enum: Order, description: `Default ${Order.DESC}` })
  @IsOptional()
  order?: Order = Order.DESC;

}
