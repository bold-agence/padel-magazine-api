import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;
  private readonly endPoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(private readonly configService: ConfigService) {
    this.endPoint = this.configService.get<string>('minio.endPoint') ?? '';
    this.port = this.configService.get<number>('minio.port') ?? 9000;
    this.useSSL = this.configService.get<boolean>('minio.useSSL') ?? false;
    this.bucket = this.configService.get<string>('minio.bucket') ?? '';
    this.publicUrl = this.configService.get<string>('minio.publicUrl');

    this.client = new Client({
      endPoint: this.endPoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.configService.get<string>('minio.accessKey') ?? '',
      secretKey: this.configService.get<string>('minio.secretKey') ?? '',
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const objectName = `${folder}/${Date.now()}-${file.originalname}`;
    this.logger.log(
      `Upload start (bucket=${this.bucket}, object=${objectName}, size=${file.size}, type=${file.mimetype})`,
    );

    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        this.logger.warn(`Bucket "${this.bucket}" does not exist, creating...`);
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" created`);
      }

      await this.client.putObject(
        this.bucket,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );
      this.logger.log(`Upload success (object=${objectName})`);
    } catch (error) {
      this.logger.error(
        `Upload failed (object=${objectName})`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Unable to upload file to MinIO');
    }

    if (this.publicUrl) {
      const publicFileUrl = `${this.publicUrl}/${this.bucket}/${objectName}`;
      this.logger.debug(`Returning public URL (url=${publicFileUrl})`);
      return publicFileUrl;
    }

    const protocol = this.useSSL ? 'https' : 'http';
    const fileUrl = `${protocol}://${this.endPoint}:${this.port}/${this.bucket}/${objectName}`;
    this.logger.debug(`Returning MinIO URL (url=${fileUrl})`);
    return fileUrl;
  }
}
