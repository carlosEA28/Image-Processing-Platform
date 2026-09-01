import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateImageUseCase } from '../../application/use-cases/create-image.use-case';
import { GetImageUseCase } from '../../application/use-cases/get-image.use-case';
import { ListImagesUseCase } from '../../application/use-cases/list-images.use-case';
import { DeleteImageUseCase } from '../../application/use-cases/delete-image.use-case';
import { ListImagesQueryDto } from '../../application/dto/list-images-query.dto';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly createImageUseCase: CreateImageUseCase,
    private readonly getImageUseCase: GetImageUseCase,
    private readonly listImagesUseCase: ListImagesUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.createImageUseCase.execute(file);
  }

  @Get()
  async findAll(@Query() query: ListImagesQueryDto) {
    return this.listImagesUseCase.execute(query.limit, query.offset);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getImageUseCase.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteImageUseCase.execute(id);
  }
}
