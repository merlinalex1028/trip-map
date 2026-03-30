import {
  Body,
  Controller,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import type { SmokeRecordResponse } from '@trip-map/contracts'

import { CreateSmokeRecordDto } from './dto/create-smoke-record.dto.js'
import { RecordsService } from './records.service.js'

@Controller('records')
export class RecordsController {
  constructor(
    @Inject(RecordsService)
    private readonly recordsService: RecordsService,
  ) {}

  @Post('smoke')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: CreateSmokeRecordDto,
  }))
  createSmoke(
    @Body() body: CreateSmokeRecordDto,
  ): SmokeRecordResponse {
    return this.recordsService.createSmoke(body)
  }
}
