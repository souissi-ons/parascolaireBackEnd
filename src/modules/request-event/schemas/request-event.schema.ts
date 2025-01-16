// request-event.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Ajoute automatiquement `createdAt` et `updatedAt`
export class RequestEvent extends Document {
  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ required: true, ref: 'Event' }) // Référence à la collection Event
  eventId: string;

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

export const RequestEventSchema = SchemaFactory.createForClass(RequestEvent);
