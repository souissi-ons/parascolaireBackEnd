// request-event.service.ts
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestEvent } from './schemas/request-event.schema';
import { CreateRequestEventDto } from './dto/create-request-event.dto';
import { UpdateRequestEventDto } from './dto/update-request-event.dto';
import { EventService } from 'src/modules/event/event.service';
import { UserService } from 'src/user/user.service';
import { validateDates } from 'src/utils/validate-date.utils';

@Injectable()
export class RequestEventService {
  constructor(
    @InjectModel(RequestEvent.name) private reqEventModel: Model<RequestEvent>,
    private readonly eventService: EventService,
    private readonly userService: UserService,
  ) {}

  async create(
    createRequestEventDto: CreateRequestEventDto,
  ): Promise<RequestEvent> {
    await this.eventService.findOne(createRequestEventDto.eventId);

    const user = await this.userService.findOne(
      createRequestEventDto.requestedBy,
    );
    if (user.role !== 'club') {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: "L'organisateur doit être un club.",
        },
        HttpStatus.CONFLICT,
      );
    }

    validateDates(
      createRequestEventDto.startDateTime,
      createRequestEventDto.endDateTime,
    );

    await this.checkForConflicts(
      createRequestEventDto.eventId,
      createRequestEventDto.startDateTime,
      createRequestEventDto.endDateTime,
    );

    const newRequest = new this.reqEventModel(createRequestEventDto);
    return newRequest.save();
  }

  async findAll(): Promise<RequestEvent[]> {
    return this.reqEventModel.find().exec();
  }

  async findOne(id: string): Promise<RequestEvent> {
    const request = await this.reqEventModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Request event with id ${id} not found`);
    }
    return request;
  }

  async update(
    id: string,
    updateRequestEventDto: UpdateRequestEventDto,
  ): Promise<RequestEvent> {
    const existingRequest = await this.findOne(id);

    const conflictingRequest = await this.reqEventModel
      .findOne({
        eventId: updateRequestEventDto.eventId,
        _id: { $ne: id },
        startDateTime: { $lt: updateRequestEventDto.endDateTime },
        endDateTime: { $gt: updateRequestEventDto.startDateTime },
      })
      .exec();

    if (conflictingRequest) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message:
            'Un événement existe déjà dans cette plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (
      updateRequestEventDto.startDateTime >= updateRequestEventDto.endDateTime
    ) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'La date de début doit être antérieure à la date de fin.',
        },
        HttpStatus.CONFLICT,
      );
    }

    await this.eventService.findOne(updateRequestEventDto.eventId);
    await this.userService.findOne(updateRequestEventDto.requestedBy);

    Object.assign(existingRequest, updateRequestEventDto);
    return existingRequest.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.reqEventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Request event with id ${id} not found`);
    }
  }

  async checkForConflicts(
    eventId: string,
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<void> {
    const conflictingRequest = await this.reqEventModel
      .findOne({
        eventId,
        status: 'confirmed',
        startDateTime: { $lt: endDateTime },
        endDateTime: { $gt: startDateTime },
      })
      .exec();

    if (conflictingRequest) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message:
            'Une demande acceptée existe déjà pour cet événement dans la plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }
  }
}
