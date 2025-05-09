import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  //validation dto
  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true }));
  

  const config = new DocumentBuilder()
    .setTitle('User Post')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, documentFactory);
  
  // app.use('/uploads', express.static(join(__dirname, 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`------------------------------Your application is runing on ${process.env.PORT ?? 3000}---------------------------------`);
}
bootstrap();
