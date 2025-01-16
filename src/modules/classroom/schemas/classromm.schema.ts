import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Classroom extends Document {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  num: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true, default: true })
  available: boolean;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
