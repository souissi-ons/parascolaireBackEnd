import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, match: /^\d{8}$/ })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'student', 'club'] })
  role: string;

  @Prop({ default: null })
  clubDescription?: string;

  @Prop({ default: null })
  clubLogo?: string;

  @Prop({ default: null })
  domaine?: string;

  @Prop({ default: null })
  facebook?: string;

  @Prop({ default: null })
  instagram?: string;

  @Prop({ default: null })
  linkedin?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({
    type: [
      {
        memberId: { type: Types.ObjectId, ref: 'User' },
        memberRole: String,
        memberSince: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  members?: Array<{
    memberId: Types.ObjectId;
    memberRole: string;
    memberSince: Date;
  }>;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
