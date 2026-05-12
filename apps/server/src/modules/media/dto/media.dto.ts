import { IsString, IsIn } from 'class-validator';

export class PresignedUrlDto {
  @IsString()
  fileName: string;

  @IsString()
  @IsIn(['image', 'model_3d', 'model_upload', 'other'])
  fileType: string;

  @IsString()
  contentType: string;
}

export class UploadCallbackDto {
  @IsString()
  fileKey: string;

  @IsString()
  fileName: string;

  @IsString()
  fileType: string;
}
