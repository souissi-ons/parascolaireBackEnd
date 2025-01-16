// request-event.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { RequestEventService } from './request-event.service';
import { RequestEventController } from './request-event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RequestEvent,
  RequestEventSchema,
} from './schemas/request-event.schema';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/modules/event/event.module';

@Module({
  controllers: [RequestEventController],
  providers: [RequestEventService],
  imports: [
    MongooseModule.forFeature([
      { name: RequestEvent.name, schema: RequestEventSchema },
    ]),
    UserModule,
    forwardRef(() => EventModule),
  ],
  exports: [RequestEventService],
})
export class RequestEventModule {}
