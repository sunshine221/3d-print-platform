import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { MediaService } from './media.service';
import { PresignedUrlDto, UploadCallbackDto } from './dto/media.dto';

@Controller('admin/media')
@UseGuards(JwtAdminGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: PresignedUrlDto) {
    return this.mediaService.getPresignedUrl(dto);
  }

  @Post('verify')
  verifyUpload(@Body() dto: UploadCallbackDto) {
    return this.mediaService.verifyUpload(dto.fileKey);
  }

  @Get()
  list(
    @Query('folderId') folderId?: string,
    @Query('fileType') fileType?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.mediaService.getMediaList(
      folderId || null,
      fileType,
      page || 1,
      pageSize || 20,
    );
  }

  @Post('folders')
  createFolder(@Body() body: { name: string; parentId?: string }) {
    return this.mediaService.createFolder(body.name, body.parentId);
  }
}
