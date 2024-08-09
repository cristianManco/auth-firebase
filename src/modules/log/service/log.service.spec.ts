import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogService } from './log.service';
import { Log } from '../entities/log.entity';

const mockLog = {
  save: jest.fn().mockResolvedValue(true),
};

describe('LogsService', () => {
  let service: LogService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<Log>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        {
          provide: getModelToken('Log'),
          useValue: mockLog,
        },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
    model = module.get<Model<Log>>(getModelToken('Log'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log a request', async () => {
    const logDto = {
      ip: '127.0.0.1',
      apiKey: 'test-key',
      endpoint: '/test',
      method: 'GET',
      action: 'Request',
      responseStatus: 200,
      responseTime: 100,
      details: 'Test log',
    };

    await expect(
      service.logRequest(
        logDto.ip,
        logDto.apiKey,
        logDto.endpoint,
        logDto.method,
        logDto.action,
        null,
        null,
        logDto.responseStatus,
        logDto.responseTime,
        logDto.details,
      ),
    ).resolves.toBeTruthy();

    expect(mockLog.save).toHaveBeenCalled();
  });
});
