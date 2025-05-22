import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CommentEnum, Order } from "../enum/pagination.enum";

export class CreateCommentDto {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    comment: string;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
    @IsNumber()
    post_id: number;
}
export class UpdateCommentDto {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    comment: string;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
    @IsNumber()
    post_id: number;
}

export class SortingCommentDto {
  @ApiPropertyOptional({ default: CommentEnum.id, enum: CommentEnum })
  @IsEnum(CommentEnum)
  @IsOptional()
  orderByColumn: CommentEnum = CommentEnum.id;

  @ApiPropertyOptional({ default: Order.DESC, enum: Order, description: `Default ${Order.DESC}` })
  @IsOptional()
  order?: Order = Order.DESC;

}