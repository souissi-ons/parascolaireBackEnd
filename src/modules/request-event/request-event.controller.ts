// request-event.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RequestEventService } from './request-event.service';
import { CreateRequestEventDto } from './dto/create-request-event.dto';
import { UpdateRequestEventDto } from './dto/update-request-event.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('request-event')
export class RequestEventController {
  constructor(private readonly requestEventService: RequestEventService) {}

  @Post()
  create(@Body() createRequestEventDto: CreateRequestEventDto) {
    return this.requestEventService.create(createRequestEventDto);
  }

  @Get()
  findAll() {
    return this.requestEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestEventService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequestEventDto: UpdateRequestEventDto,
  ) {
    return this.requestEventService.update(id, updateRequestEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestEventService.remove(id);
  }
}
