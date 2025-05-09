import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Multer } from 'multer';
import { Uploads } from 'src/common/entities/upload.entiity';
import { getCommonResponse } from 'src/common/function/common-response.util';
import { PaginationDto, SortingUploadsDto } from 'src/common/dto/pagination.dto';
import { GetAll } from 'src/common/enum/pagination.enum';

@Injectable()
export class UploadService {
private readonly uploadPath = path.join(__dirname, '..', '..', 'uploads');

constructor(
    @InjectRepository(Uploads) private readonly uploadRepository: Repository<Uploads>,
) {}

async uploadFile(file: Express.Multer.File): Promise<any>
{
try{
    // Create upload directory if not exists
    if (!fs.existsSync(this.uploadPath)) {
    fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    const filePath = path.join(this.uploadPath, uniqueFilename);
    const relativePath = path.join('uploads', uniqueFilename).replace(/\\/g, '/');
    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);
    
    
    const upload = this.uploadRepository.create({
    fieldname: 'file',
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    filename: uniqueFilename,
    path: relativePath,
    });
    const saveupload = await this.uploadRepository.save(upload);
    
    if (saveupload) {
        return getCommonResponse(200, 'File uploaded successfully',new Uploads(saveupload));
    } else {
        return getCommonResponse(500, 'File upload failed', '');
    }
    } catch (error) {
    console.error('Upload Error:', error);
    return error;
    }
}
async findAll(paginationDto: PaginationDto, sortingUploadsDto: SortingUploadsDto) {
    try {
        const { getall, limit, offset, search } = paginationDto;
        const query = this.uploadRepository.createQueryBuilder('upload')
        const { orderByColumn, order } = sortingUploadsDto;
    if (search) {
        let optimizedSearch = search
            .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
            .replace(/\s+(?!\s*$)/g, '|');
        query.andWhere(`(upload.filename REGEXP :keyword
                        OR upload.originalname REGEXP :keyword)`, { keyword: optimizedSearch });
    }
    if (getall == GetAll.NO) {
        query.skip(offset * limit).take(limit);
    }
    const total_records = await query.clone().getCount();
    if (orderByColumn && order) {
        query.orderBy(`upload.${orderByColumn}`, order)
    }
    const findAllData = await query.getMany();
    if (findAllData.length) {
        return getCommonResponse(200, 'Record fetch successfully', findAllData.map(u => new Uploads(u)), total_records);
    } else {
        return getCommonResponse(404, 'Not found', '');
    }
    } catch (error) {
    console.error('Error fetching user', { error });
    throw error;
    }
}
async findOne(upload_id: number) {
    try {
      const upload = await this.uploadRepository.findOne({ where: { upload_id } }); // use `id` instead of `upload_id`
        if (!upload) {
            return getCommonResponse(404, `Not found.`, '');
        }
        return getCommonResponse(200, 'Record fetched successfully', new Uploads(upload));
    } catch (error) {
        console.error('Error finding record by ID', { error });
        throw error;
    }
}

async remove(upload_id: number) {
    try {
        const uploadid = await this.uploadRepository.findOne({ where: { upload_id }});
        if (!uploadid) {
            return getCommonResponse(404, `User id not found`, '');
        }
    await this.uploadRepository.remove(uploadid);
    return getCommonResponse(200, 'Record removed successfully', '');
    } catch (error) {
    console.error('Error removing user', { error });
      // Catch DB constraint errors and return a user-friendly message
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return getCommonResponse(400, 'Cannot delete this record because it is referenced by other records. Please ensure there are no related records before attempting to delete.', '');
    }
    return getCommonResponse(500, 'An unexpected error occurred.', '');
        }
    }
}
