import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { likeEnum, Order } from "../enum/pagination.enum";

export class CreateLikeDto {

    @ApiProperty({ type: Number, required: true })
    @IsNotEmpty()
    @IsNumber()
    post_id: number;
}
export class UpdateLikeDto extends PartialType(CreateLikeDto) {}

export class SortingLikeDto {
  @ApiPropertyOptional({ default: likeEnum.id, enum: likeEnum })
  @IsEnum(likeEnum)
  @IsOptional()
  orderByColumn: likeEnum = likeEnum.id;

  @ApiPropertyOptional({ default: Order.DESC, enum: Order, description: `Default ${Order.DESC}` })
  @IsOptional()
  order?: Order = Order.DESC;
}