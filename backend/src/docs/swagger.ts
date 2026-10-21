import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('ProofLab API')
    .setDescription(
      'API for research funding, milestone review and community governance on Solana Devnet. Wallet login requires a signed nonce. Solana routes prepare transactions for wallet signature; AI availability depends on server configuration.',
    )
    .setVersion('0.0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'wallet-jwt',
    )
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: 'docs-json',
      customSiteTitle: 'ProofLab API',
      swaggerOptions: { persistAuthorization: false, docExpansion: 'list' },
    },
  );
}
