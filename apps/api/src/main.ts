import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const corsOrigin = process.env.CORS_ORIGIN;
  const app = await NestFactory.create(AppModule, {
    cors: corsOrigin
      ? { origin: corsOrigin.split(',').map((s) => s.trim()), credentials: true }
      : true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ALL ROADS API')
    .setDescription('Plataforma SaaS de gestión operativa y logística')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 API lista en puerto ${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger en /api/docs`, 'Bootstrap');
}
bootstrap();
