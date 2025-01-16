import { Test, TestingModule } from '@nestjs/testing';
import { RequestClassroomService } from './request-classroom.service';

describe('RequestClassroomService', () => {
  let service: RequestClassroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestClassroomService],
    }).compile();

    service = module.get<RequestClassroomService>(RequestClassroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
