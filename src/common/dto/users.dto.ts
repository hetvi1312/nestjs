import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Order, UserEnum } from "../enum/pagination.enum";

export class CreateUserDto {
    @ApiProperty({ type: String, required: true })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ type: String, required: true })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ type: String, required: true })
    @IsNotEmpty()
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

export class UpdateUserDto{
  @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    username: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;
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
