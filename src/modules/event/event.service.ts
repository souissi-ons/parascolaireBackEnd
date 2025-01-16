// event.service.ts
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ClassroomService } from 'src/modules/classroom/classroom.service';
import { validateDates } from 'src/utils/validate-date.utils';
import * as fs from 'fs';
import { join } from 'path';
import { UserService } from 'src/user/user.service';
import { RequestClassroomService } from 'src/request-classroom/request-classroom.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly userService: UserService,
    private readonly classService: ClassroomService,
    @Inject(forwardRef(() => RequestClassroomService))
    private readonly requestClassroomService: RequestClassroomService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    await this.classService.findOne(createEventDto.roomId);

    const user = await this.userService.findOne(createEventDto.organizerId);
    if (user.role !== 'club') {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: "L'organisateur doit être un club.",
        },
        HttpStatus.CONFLICT,
      );
    }

    validateDates(createEventDto.startDateTime, createEventDto.endDateTime);

    await this.requestClassroomService.checkForConflicts(
      createEventDto.roomId,
      createEventDto.startDateTime,
      createEventDto.endDateTime,
    );

    await this.findConflictingEvent(
      createEventDto.roomId,
      createEventDto.startDateTime,
      createEventDto.endDateTime,
    );

    const newEvent = new this.eventModel(createEventDto);
    return newEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findAllRequest(): Promise<Event[]> {
    return this.eventModel.find({ status: 'pending' }).exec();
  }

  async findAllUserRequest(id: string): Promise<Event[]> {
    return this.eventModel.find({ organizerId: id }).exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(new Types.ObjectId(id)).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const existingEvent = await this.findOne(id);

    const conflictingEvent = await this.eventModel
      .findOne({
        roomId: updateEventDto.roomId,
        _id: { $ne: new Types.ObjectId(id) },
        startDateTime: { $lt: updateEventDto.endDateTime },
        endDateTime: { $gt: updateEventDto.startDateTime },
      })
      .exec();

    if (conflictingEvent) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message:
            'Un événement existe déjà dans cette salle pendant la plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (updateEventDto.startDateTime >= updateEventDto.endDateTime) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'La date de début doit être antérieure à la date de fin.',
        },
        HttpStatus.CONFLICT,
      );
    }

    await this.classService.findOne(updateEventDto.roomId);
    await this.userService.findOne(updateEventDto.organizerId);

    Object.assign(existingEvent, updateEventDto);
    return existingEvent.save();
  }

  async findConflictingEvent(
    roomId: string,
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<void> {
    const conflictingEvent = await this.eventModel
      .findOne({
        roomId,
        status: 'confirmed',
        startDateTime: { $lt: endDateTime },
        endDateTime: { $gt: startDateTime },
      })
      .exec();

    if (conflictingEvent) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message:
            'Un événement accepté existe déjà pour cette salle dans la plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async findEvents(userId: string): Promise<Event[]> {
    const user = await this.userService.findOne(userId);

    if (user.role === 'admin') {
      return this.eventModel.find({ status: 'confirmed' }).exec();
    }

    if (user.role === 'club') {
      return this.eventModel
        .find({
          $and: [
            { $or: [{ private: false }, { organizerId: user.id }] },
            { status: 'confirmed' },
          ],
        })
        .exec();
    }

    if (user.role === 'student') {
      const clubs = await this.userService.getClubsByUserId(userId);
      const clubIds = clubs.map((club) => club._id.toString());

      return this.eventModel
        .find({
          $and: [
            { $or: [{ private: false }, { organizerId: { $in: clubIds } }] },
            { status: 'confirmed' },
          ],
        })
        .exec();
    }

    return [];
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
  }

  async getImageByEventId(id: string): Promise<string> {
    const event = await this.findOne(id);
    const imagePath = join(
      __dirname,
      '..',
      '..',
      event.imageUrl.replace('/', ''),
    );

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }

    return imagePath;
  }
}
