import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DemoAdminGuard } from './demo-admin.guard';

function createContext(token?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: token ? { 'x-demo-admin-token': token } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

function createGuard(environment: Record<string, string | undefined>) {
  const config = {
    get: (key: string) => environment[key],
  } as ConfigService;

  return new DemoAdminGuard(config);
}

describe('DemoAdminGuard', () => {
  it('allows local mutations when no token is configured', () => {
    const guard = createGuard({ NODE_ENV: 'development' });

    expect(guard.canActivate(createContext())).toBe(true);
    expect(guard.arePublicMutationsEnabled()).toBe(true);
  });

  it('blocks production mutations when no token is configured', () => {
    const guard = createGuard({ NODE_ENV: 'production' });

    expect(() => guard.canActivate(createContext())).toThrow(
      ServiceUnavailableException,
    );
    expect(guard.arePublicMutationsEnabled()).toBe(false);
  });

  it('fails closed when NODE_ENV is not explicitly configured', () => {
    const guard = createGuard({});

    expect(() => guard.canActivate(createContext())).toThrow(
      ServiceUnavailableException,
    );
    expect(guard.arePublicMutationsEnabled()).toBe(false);
  });

  it('requires the configured token', () => {
    const guard = createGuard({
      NODE_ENV: 'production',
      DEMO_ADMIN_TOKEN: 'a-long-demo-admin-token',
    });

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );

    expect(() => guard.canActivate(createContext('wrong-token'))).toThrow(
      UnauthorizedException,
    );
    expect(guard.canActivate(createContext('a-long-demo-admin-token'))).toBe(
      true,
    );
  });
});
