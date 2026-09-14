import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './docs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Keep browser access closed unless the single frontend origin is configured.
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  app.enableCors({
    origin: frontendUrl || false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  configureSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
