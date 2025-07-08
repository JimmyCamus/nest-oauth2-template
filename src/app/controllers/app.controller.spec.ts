import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../services/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('should return a valid health object', () => {
      const result = appController.healthCheck();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('uptime');
    });
  });
});
