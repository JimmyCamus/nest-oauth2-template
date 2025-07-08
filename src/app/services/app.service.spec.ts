import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the status check message', () => {
    const response = service.healthCheck();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(response).toEqual({ status: 'ok', uptime: expect.any(String) });
  });
});
