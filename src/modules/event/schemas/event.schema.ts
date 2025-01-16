import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // Importer Types

@Schema({ timestamps: true }) // Ajoute automatiquement `createdAt` et `updatedAt`
export class Event extends Document {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() }) // Ajouter _id
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ required: true, ref: 'Classroom', type: Types.ObjectId }) // Référence à la collection Classroom
  roomId: Types.ObjectId;

  @Prop({ required: true, ref: 'User', type: Types.ObjectId }) // Référence à la collection User
  organizerId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'confirmed', 'canceled', 'refused'],
  })
  status: string;

  @Prop({ default: false })
  private: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
