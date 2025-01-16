import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestClassroomDto } from './create-request-classroom.dto';

export class UpdateRequestClassroomDto extends PartialType(
  CreateRequestClassroomDto,
) {}
