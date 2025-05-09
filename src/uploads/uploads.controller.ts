import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UploadService } from './uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Uploads } from 'src/common/entities/upload.entiity';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { PaginationDto, SortingUploadsDto } from 'src/common/dto/pagination.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Uploads> {
    return this.uploadService.uploadFile(file);
  }
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query() sortingUploadsDto: SortingUploadsDto) {
    return this.uploadService.findAll(paginationDto, sortingUploadsDto);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.uploadService.findOne(id);
  }
    
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    //   return this.postService.update(+id, updatePostDto);
    // }
    
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.uploadService.remove(id);
  }
  
}
