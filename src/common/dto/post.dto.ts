import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Order, PostEnum } from "../enum/pagination.enum";


export class CreatePostDto {
  id?: number;

    @ApiProperty({ type: String , required: false})
    @IsOptional()
    @IsString()
    caption: string;

    @ApiProperty({ type: Number, required: false})
    @IsOptional()
    @IsNumber()
    upload_id: number; 

    @ApiProperty({ type: Boolean , required: false})
    @IsOptional()
    @IsBoolean()
    likesEnabled: boolean;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class SortingPostsDto {
  @ApiPropertyOptional({ default: PostEnum.id, enum: PostEnum })
  @IsEnum(PostEnum)
  @IsOptional()
  orderByColumn: PostEnum = PostEnum.id;

  @ApiPropertyOptional({ default: Order.DESC, enum: Order, description: `Default ${Order.DESC}` })
  @IsOptional()
  order?: Order = Order.DESC;

}