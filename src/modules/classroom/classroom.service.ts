// classroom.service.ts
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { Classroom } from './schemas/classromm.schema';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
  ) {}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const existingClass = await this.classroomModel
      .findOne({ num: createClassroomDto.num })
      .exec();
    if (existingClass) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Une salle avec ce numéro existe déjà.',
        },
        HttpStatus.CONFLICT,
      );
    }
    const newClass = new this.classroomModel(createClassroomDto);
    return newClass.save();
  }

  async findAll(): Promise<Classroom[]> {
    return this.classroomModel.find().exec();
  }

  async findOne(id: string): Promise<Classroom> {
    const classroom = await this.classroomModel
      .findById(new Types.ObjectId(id))
      .exec();
    if (!classroom) {
      throw new NotFoundException(`Classroom with id ${id} not found`);
    }
    return classroom;
  }

  async update(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<Classroom> {
    try {
      // Check if the classroom exists
      const existingClassroom = await this.findOne(id);

      // Check for duplicate num
      const otherClass = await this.classroomModel
        .findOne({
          num: updateClassroomDto.num,
          _id: { $ne: new Types.ObjectId(id) }, // Convert id to ObjectId
        })
        .exec();

      if (otherClass) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: 'Une salle avec ce numéro existe déjà.',
          },
          HttpStatus.CONFLICT,
        );
      }

      // Use findByIdAndUpdate to avoid issues with .save()
      const updatedClassroom = await this.classroomModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        updateClassroomDto,
        { new: true }, // Return the updated document
      );

      if (!updatedClassroom) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: "La salle de classe n'existe pas.",
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return updatedClassroom;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            'Une erreur est survenue lors de la mise à jour de la salle de classe.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.classroomModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Classroom with id ${id} not found`);
    }
  }

  async updateClassroom(id: string, updateData: Partial<Classroom>) {
    const existingClassroom = await this.classroomModel
      .findById(new Types.ObjectId(id))
      .exec();
    if (!existingClassroom) {
      throw new Error('Classroom not found');
    }
    Object.assign(existingClassroom, updateData);
    return existingClassroom.save(); // This should now work
  }
}
