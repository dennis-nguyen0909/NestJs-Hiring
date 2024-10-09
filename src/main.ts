import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8081;
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Địa chỉ của frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Phương thức cho phép
    credentials: true, // Cho phép cookies
  });
  //config api
  app.setGlobalPrefix('/api/v1', { exclude: [''] });
  //config validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các trường ko cần check
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hiring API')
    .setDescription('This api use for hiring application')
    .setVersion('1.0')
    .addTag('hiring')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
