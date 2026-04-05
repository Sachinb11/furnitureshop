import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private useS3: boolean;

  constructor(private config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Only use S3 if real credentials are set
    const bucket = config.get('AWS_S3_BUCKET', '');
    const keyId  = config.get('AWS_ACCESS_KEY_ID', 'placeholder');
    this.useS3 = Boolean(bucket && keyId && keyId !== 'placeholder');

    // Ensure local upload dir exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'products',
  ): Promise<{ url: string; key: string }> {
    if (!file) throw new BadRequestException('No file provided');

    if (this.useS3) {
      return this.uploadToS3(file, folder);
    }
    return this.uploadToLocal(file, folder);
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const ext      = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const subDir   = path.join(this.uploadDir, folder);

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const filepath = path.join(subDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const key = `${folder}/${filename}`;
    const baseUrl = this.config.get('FRONTEND_URL', 'http://localhost:3001');
    const url     = `${this.config.get('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api/v1').replace('/api/v1', '')}/uploads/${key}`;

    return { url, key };
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { v4: uuidv4 } = await import('uuid');

    const ext    = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key    = `${folder}/${uuidv4()}${ext}`;
    const bucket = this.config.get('AWS_S3_BUCKET');
    const region = this.config.get('AWS_REGION', 'ap-south-1');

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId:     this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket:      bucket,
        Key:         key,
        Body:        file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const cdn = this.config.get('AWS_CLOUDFRONT_DOMAIN');
    const url = cdn
      ? `https://${cdn}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  }

  async deleteImage(key: string): Promise<void> {
    if (this.useS3) {
      try {
        const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const s3 = new S3Client({
          region: this.config.get('AWS_REGION', 'ap-south-1'),
          credentials: {
            accessKeyId:     this.config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
        await s3.send(
          new DeleteObjectCommand({ Bucket: this.config.get('AWS_S3_BUCKET'), Key: key }),
        );
      } catch {}
    } else {
      // Delete local file
      const filepath = path.join(this.uploadDir, key);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }
}
