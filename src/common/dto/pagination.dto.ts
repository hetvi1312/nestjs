import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { GetAll, Order, UploadsEnum } from "../enum/pagination.enum";

export class PaginationDto {
    
    @ApiPropertyOptional({ default: 20, description: 'limit of records.' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 20;

    @ApiPropertyOptional({ default: 0, description: 'skip use as offset.' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset: number = 0;

    @ApiPropertyOptional({ default: GetAll.NO, enum: GetAll })
    @IsOptional()
    getall?: string = GetAll.NO;

    @ApiPropertyOptional({ default: "" })
    @IsString()
    @IsOptional()
    @Matches(/^[a-zA-Z0-9_@. -]*$/, { message: 'Search must not contain special characters except spaces, -, @, and dots' })
    search?: string

    constructor() {
        this.limit = 20;
        this.offset = 0;
        this.getall = GetAll.NO;
        this.search = "";
    }
}

export class SortingUploadsDto {
    @ApiPropertyOptional({ enum: UploadsEnum, default: UploadsEnum.upload_id })
    @IsOptional()
    @IsEnum(UploadsEnum)
    orderByColumn?: UploadsEnum = UploadsEnum.upload_id;

    @ApiPropertyOptional({ default: Order.DESC, enum: Order, description: `Default ${Order.DESC}` })
    @IsOptional()
    order?: Order = Order.DESC;
}