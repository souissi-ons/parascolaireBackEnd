// request-classroom.module.ts
import { Module } from '@nestjs/common';
import { RequestClassroomService } from './request-classroom.service';
import { RequestClassroomController } from './request-classroom.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RequestClassroom,
  RequestClassroomSchema,
} from './schemas/request-classroom.schema';
import { ClassroomModule } from 'src/modules/classroom/classroom.module';
import { EventModule } from 'src/modules/event/event.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [RequestClassroomController],
  providers: [RequestClassroomService],
  imports: [
    MongooseModule.forFeature([
      { name: RequestClassroom.name, schema: RequestClassroomSchema },
    ]),
    ClassroomModule,
    UserModule,
    EventModule,
  ],
  exports: [RequestClassroomService],
})
export class RequestClassroomModule {}
