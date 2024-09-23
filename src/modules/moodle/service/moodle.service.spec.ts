import { Test, TestingModule } from '@nestjs/testing';
import { MoodleService } from './moodle.service';

describe('MoodleService', () => {
  let service: MoodleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoodleService],
    }).compile();

    service = module.get<MoodleService>(MoodleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
