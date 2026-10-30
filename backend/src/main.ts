import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FallbackExceptionFilter } from './common/fallback-exception.filter';
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
      exceptionFactory: (errors) =>
        new BadRequestException(
          `Dados inválidos. Verifique: ${errors
            .map((error) => error.property)
            .join(', ')}.`,
        ),
    }),
  );
  app.useGlobalFilters(
    new FallbackExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  configureSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
