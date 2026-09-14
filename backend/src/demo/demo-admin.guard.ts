import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class DemoAdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredToken = this.getConfiguredToken();

    if (!configuredToken) {
      if (!this.isDevelopment()) {
        throw new ServiceUnavailableException(
          'Demo mutations are disabled until DEMO_ADMIN_TOKEN is configured',
        );
      }

      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const providedToken = request.headers['x-demo-admin-token'];

    if (
      typeof providedToken !== 'string' ||
      !this.tokensMatch(configuredToken, providedToken)
    ) {
      throw new UnauthorizedException('A valid demo admin token is required');
    }

    return true;
  }

  arePublicMutationsEnabled(): boolean {
    return this.isDevelopment() && !this.getConfiguredToken();
  }

  private getConfiguredToken(): string | undefined {
    return this.config.get<string>('DEMO_ADMIN_TOKEN')?.trim() || undefined;
  }

  private isDevelopment(): boolean {
    return this.config.get<string>('NODE_ENV') === 'development';
  }

  private tokensMatch(expected: string, provided: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided);

    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    );
  }
}
