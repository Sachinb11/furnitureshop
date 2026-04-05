import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);

  // ── Serve uploaded files statically ────────────────────────────────────
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ── Global prefix & versioning ─────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: true, // Allow all origins in dev. Restrict in production via env.
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ── Global validation ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filters & interceptors ─────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ────────────────────────────────────────────────────────────
  // const swaggerCfg = new DocumentBuilder()
  //   .setTitle('Furnishop API')
  //   .setDescription('eCommerce API — use /api/v1 prefix for all endpoints')
  //   .setVersion('1.0')
  //   .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
  //   .build();
  // SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerCfg));

  const port = config.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`\n✅ Furnishop API ready:`);
  console.log(`   API:    http://localhost:${port}/api/v1`);
  console.log(`   Docs:   http://localhost:${port}/docs`);
  console.log(`   Health: http://localhost:${port}/api/v1/health\n`);
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
