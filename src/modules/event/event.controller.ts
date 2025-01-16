// event.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';

@ApiBearerAuth()
@Public()
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('request')
  createRequest(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get('requests')
  getAllRequest() {
    return this.eventService.findAllRequest();
  }

  @Get(':id/requests')
  getAllUserRequest(@Param('id') id: string) {
    return this.eventService.findAllUserRequest(id);
  }

  @Patch(':id/reject')
  async rejectEvent(@Param('id') id: string): Promise<any> {
    const event = await this.eventService.findOne(id);
    event.status = 'refused';
    return event.save();
  }

  @Patch(':id/accept')
  async acceptEvent(@Param('id') id: string): Promise<any> {
    const event = await this.eventService.findOne(id);
    event.status = 'confirmed';
    return event.save();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createEventDto.imageUrl = `/uploads/${file.filename}`;
    }
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Public()
  @Get(':id/all')
  findEvents(@Param('id') id: string) {
    return this.eventService.findEvents(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    try {
      const imagePath = await this.eventService.getImageByEventId(id);
      return res.sendFile(imagePath);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateEventDto.imageUrl = `/uploads/${file.filename}`;
    }
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
