import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/**
 * Unexpected errors (database, RPC, bugs) reach the client as a readable
 * Portuguese message instead of Nest's default "Internal server error".
 * The original error is kept in the logs.
 */
@Catch()
export class FallbackExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(FallbackExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    this.logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : exception,
    );
    super.catch(
      new InternalServerErrorException(
        'Erro interno do servidor. Tente novamente em instantes.',
      ),
      host,
    );
  }
}
