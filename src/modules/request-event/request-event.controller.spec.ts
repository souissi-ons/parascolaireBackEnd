import { Test, TestingModule } from '@nestjs/testing';
import { RequestEventController } from './request-event.controller';
import { RequestEventService } from './request-event.service';

describe('RequestEventController', () => {
  let controller: RequestEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestEventController],
      providers: [RequestEventService],
    }).compile();

    controller = module.get<RequestEventController>(RequestEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
