// event.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { ClassroomModule } from 'src/modules/classroom/classroom.module';
import { RequestClassroomModule } from 'src/request-classroom/request-classroom.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    UserModule,
    ClassroomModule,
    forwardRef(() => RequestClassroomModule),
  ],
  exports: [EventService],
})
export class EventModule {}
