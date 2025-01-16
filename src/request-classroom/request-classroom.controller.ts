// request-classroom.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RequestClassroomService } from './request-classroom.service';
import { CreateRequestClassroomDto } from './dto/create-request-classroom.dto';
import { UpdateRequestClassroomDto } from './dto/update-request-classroom.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiBearerAuth()
@Public()
@Controller('request-classroom')
export class RequestClassroomController {
  constructor(
    private readonly requestClassroomService: RequestClassroomService,
  ) {}

  @Post()
  create(@Body() createRequestClassroomDto: CreateRequestClassroomDto) {
    return this.requestClassroomService.create(createRequestClassroomDto);
  }

  @Get()
  findAll() {
    return this.requestClassroomService.findAll();
  }

  @Get('requestedBy/:id')
  findByUser(@Param('id') id: string) {
    return this.requestClassroomService.findByUser(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestClassroomService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequestClassroomDto: UpdateRequestClassroomDto,
  ) {
    return this.requestClassroomService.update(id, updateRequestClassroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestClassroomService.remove(id);
  }
}
