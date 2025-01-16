// request-classroom.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Ajoute automatiquement `createdAt` et `updatedAt`
export class RequestClassroom extends Document {
  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ required: true, ref: 'Classroom' }) // Référence à la collection Classroom
  roomId: string;

  @Prop({ required: true, ref: 'User' }) // Référence à la collection User
  requestedBy: string;

  @Prop({ required: true })
  reason: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'confirmed', 'canceled', 'refused'],
  })
  status: string;
}

export const RequestClassroomSchema =
  SchemaFactory.createForClass(RequestClassroom);
