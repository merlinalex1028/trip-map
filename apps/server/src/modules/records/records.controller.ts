import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { SmokeRecordResponse, TravelRecord as ContractTravelRecord } from '@trip-map/contracts'

import { CreateSmokeRecordDto } from './dto/create-smoke-record.dto.js'
import { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import { RecordsService } from './records.service.js'

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(
    @Inject(RecordsService)
    private readonly recordsService: RecordsService,
  ) {}

  @Post('smoke')
  @ApiOperation({ summary: '创建 smoke 记录' })
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: CreateSmokeRecordDto,
  }))
  async createSmoke(
    @Body() body: CreateSmokeRecordDto,
  ): Promise<SmokeRecordResponse> {
    return this.recordsService.createSmoke(body)
  }

  @Get()
  @ApiOperation({ summary: '获取所有旅行记录' })
  @ApiOkResponse()
  async findAll(): Promise<ContractTravelRecord[]> {
    return this.recordsService.findAllTravel()
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建旅行记录' })
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: CreateTravelRecordDto,
  }))
  async createTravel(
    @Body() body: CreateTravelRecordDto,
  ): Promise<ContractTravelRecord> {
    return this.recordsService.createTravel(body)
  }

  @Delete(':placeId')
  @HttpCode(204)
  @ApiOperation({ summary: '删除旅行记录' })
  @ApiNoContentResponse()
  async deleteTravel(@Param('placeId') placeId: string): Promise<void> {
    return this.recordsService.deleteTravel(placeId)
  }
}
