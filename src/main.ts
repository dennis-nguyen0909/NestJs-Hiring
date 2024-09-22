import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8081;

  //config api
  app.setGlobalPrefix('/api/v1', { exclude: [''] });
  //config validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các trường ko cần check
    }),
  );
  await app.listen(port);
}
bootstrap();
