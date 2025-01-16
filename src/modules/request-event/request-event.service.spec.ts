import { Test, TestingModule } from '@nestjs/testing';
import { RequestEventService } from './request-event.service';

describe('RequestEventService', () => {
  let service: RequestEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestEventService],
    }).compile();

    service = module.get<RequestEventService>(RequestEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
