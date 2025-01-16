import { Test, TestingModule } from '@nestjs/testing';
import { RequestClassroomController } from './request-classroom.controller';
import { RequestClassroomService } from './request-classroom.service';

describe('RequestClassroomController', () => {
  let controller: RequestClassroomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestClassroomController],
      providers: [RequestClassroomService],
    }).compile();

    controller = module.get<RequestClassroomController>(RequestClassroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
