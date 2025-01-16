// request-classroom.service.ts
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
import { RequestClassroom } from './schemas/request-classroom.schema';
import { CreateRequestClassroomDto } from './dto/create-request-classroom.dto';
import { UpdateRequestClassroomDto } from './dto/update-request-classroom.dto';
import { ClassroomService } from 'src/modules/classroom/classroom.service';
import { UserService } from '../user/user.service';
import { EventService } from 'src/modules/event/event.service';
import { validateDates } from 'src/utils/validate-date.utils';

@Injectable()
export class RequestClassroomService {
  constructor(
    @InjectModel(RequestClassroom.name)
    private reqClassModel: Model<RequestClassroom>,
    private readonly classService: ClassroomService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    private readonly classroomService: ClassroomService, // Injecter ClassroomService
  ) {}

  async create(
    createRequestClassroomDto: CreateRequestClassroomDto,
  ): Promise<RequestClassroom> {
    await this.classService.findOne(createRequestClassroomDto.roomId);

    const user = await this.userService.findOne(
      createRequestClassroomDto.requestedBy,
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
      createRequestClassroomDto.startDateTime,
      createRequestClassroomDto.endDateTime,
    );

    await this.checkForConflicts(
      createRequestClassroomDto.roomId,
      createRequestClassroomDto.startDateTime,
      createRequestClassroomDto.endDateTime,
    );

    await this.eventService.findConflictingEvent(
      createRequestClassroomDto.roomId,
      createRequestClassroomDto.startDateTime,
      createRequestClassroomDto.endDateTime,
    );

    const newRequest = new this.reqClassModel(createRequestClassroomDto);
    return newRequest.save();
  }

  async findAll(): Promise<any[]> {
    // Attendre la résolution de la promesse pour récupérer les demandes
    const requests = await this.reqClassModel.find().exec();

    // Si aucune demande n'est trouvée, retourner un tableau vide
    if (!requests || requests.length === 0) {
      return [];
    }

    // Pour chaque demande, récupérer le numéro de salle (`roomId`)
    const requestsWithRoomId = await Promise.all(
      requests.map(async (request) => {
        try {
          // Récupérer la salle de classe correspondante
          const classroom = await this.classroomService.findOne(
            request.roomId.toString(),
          );

          // Retourner la demande avec le numéro de salle
          return {
            ...request.toObject(), // Inclure toutes les propriétés de la demande
            num: classroom.num, // Utiliser `roomId` ou la propriété correcte
          };
        } catch (error) {
          // Gérer les erreurs (par exemple, si `roomId` est invalide)
          console.error(
            `Erreur lors de la récupération de la salle de classe pour la demande ${request._id}:`,
            error,
          );
          return {
            ...request.toObject(), // Retourner la demande sans le numéro de salle
            num: null, // Ou une valeur par défaut
          };
        }
      }),
    );

    // Retourner les demandes avec les numéros de salle
    return requestsWithRoomId;
  }

  async findByUser(requestedBy: string): Promise<any> {
    // Récupérer toutes les demandes de salles de classe pour l'utilisateur
    const requests = await this.reqClassModel.find({ requestedBy }).exec();

    // Si aucune demande n'est trouvée, retourner un tableau vide
    if (!requests || requests.length === 0) {
      return [];
    }

    // Pour chaque demande, récupérer le numéro de salle (`roomId`)
    const requestsWithRoomId = await Promise.all(
      requests.map(async (request) => {
        // Récupérer la salle de classe correspondante
        const classroom = await this.classroomService.findOne(
          request.roomId.toString(),
        );

        // Retourner la demande avec le numéro de salle
        return {
          ...request.toObject(), // Inclure toutes les propriétés de la demande
          num: classroom.num, // Ajouter le numéro de salle
        };
      }),
    );

    // Retourner les demandes avec les numéros de salle
    return requestsWithRoomId;
  }
  async findOne(id: string): Promise<RequestClassroom> {
    const request = await this.reqClassModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Request classroom with id ${id} not found`);
    }
    return request;
  }

  async update(
    id: string,
    updateRequestClassroomDto: UpdateRequestClassroomDto,
  ): Promise<RequestClassroom> {
    const existingRequest = await this.findOne(id);

    const conflictingRequest = await this.reqClassModel
      .findOne({
        roomId: updateRequestClassroomDto.roomId,
        _id: { $ne: id },
        startDateTime: { $lt: updateRequestClassroomDto.endDateTime },
        endDateTime: { $gt: updateRequestClassroomDto.startDateTime },
      })
      .exec();

    if (conflictingRequest) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message:
            'Un événement existe déjà dans cette salle pendant la plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (
      updateRequestClassroomDto.startDateTime >=
      updateRequestClassroomDto.endDateTime
    ) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'La date de début doit être antérieure à la date de fin.',
        },
        HttpStatus.CONFLICT,
      );
    }
    if (updateRequestClassroomDto.roomId !== undefined) {
      await this.classService.findOne(updateRequestClassroomDto.roomId);
    }
    if (updateRequestClassroomDto.requestedBy !== undefined) {
      await this.userService.findOne(updateRequestClassroomDto.requestedBy);
    }

    Object.assign(existingRequest, updateRequestClassroomDto);
    return existingRequest.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.reqClassModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Request classroom with id ${id} not found`);
    }
  }

  async checkForConflicts(
    roomId: string,
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<void> {
    const conflictingRequest = await this.reqClassModel
      .findOne({
        roomId,
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
            'Une demande acceptée existe déjà pour cette salle dans la plage horaire sélectionnée.',
        },
        HttpStatus.CONFLICT,
      );
    }
  }
}
