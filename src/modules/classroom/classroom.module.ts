// classroom.module.ts
import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Classroom, ClassroomSchema } from './schemas/classromm.schema';

@Module({
  controllers: [ClassroomController],
  providers: [ClassroomService],
  imports: [
    MongooseModule.forFeature([
      { name: Classroom.name, schema: ClassroomSchema },
    ]),
  ],
  exports: [ClassroomService],
})
export class ClassroomModule {}
