import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LogService } from '../service/log.service';
import { LogIterceptor } from './log.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LogIterceptor;
  let logsService: LogService;

  const mockLogsService = {
    logRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogIterceptor,
        {
          provide: LogService,
          useValue: mockLogsService,
        },
      ],
    }).compile();

    interceptor = module.get<LogIterceptor>(LogIterceptor);
    logsService = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request details', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          headers: { 'x-api-key': 'test-key' },
          url: '/test',
          method: 'GET',
        }),
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
    } as any;

    const next: CallHandler = {
      handle: () => of('test response'),
    };

    await (await interceptor.intercept(context, next)).toPromise();

    expect(logsService.logRequest).toHaveBeenCalledWith(
      '127.0.0.1',
      'test-key',
      '/test',
      'GET',
      'Request',
      null,
      null,
      200,
      expect.any(Number),
      'Response: test response',
    );
  });
});
