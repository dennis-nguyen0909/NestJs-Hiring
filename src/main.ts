import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './core/transform.interceptor';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8081;
  const reflector = app.get(Reflector);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://hire-dev.online',
      'https://frontend-hiring-minhduys-projects.vercel.app',
      'http://localhost:65417',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    exposedHeaders: ['X-My-Header'],
  });

  //config api
  app.setGlobalPrefix('/api/v1', { exclude: [''] });
  //config validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các trường ko cần check
    }),
  );
  // Sử dụng TransformInterceptor trên toàn bộ ứng dụng
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // CookiParser
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE'))
    .setDescription(configService.get('SWAGGER_DESCRIPTION'))
    .setVersion(configService.get('SWAGGER_VERSION'))
    .addTag(configService.get('SWAGGER_TAG'))
    .addBearerAuth(
      {
        type: 'http', // kiểu xác thực HTTP
        scheme: 'bearer', // sử dụng scheme bearer
        bearerFormat: 'JWT', // format của token (JWT)
        in: 'header', // token sẽ được gửi trong header
      },
      'JWT', // tên của định dạng Bearer (có thể thay đổi)
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);
  await app.listen(port);
  console.log('Server running on port: ' + port);
  console.log(
    `Swagger running on port: ${port}/${configService.get('SWAGGER_PATH')}`,
  );
  console.log(
    `Swagger running on port: ${port}/${configService.get('SWAGGER_PATH')}`,
  );
}
bootstrap();
