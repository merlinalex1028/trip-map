import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UsePipes,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type {
  AuthUser,
  ImportTravelRecordsResponse,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
  TravelStatsResponse,
} from '@trip-map/contracts'

import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js'
import { CreateSmokeRecordDto } from './dto/create-smoke-record.dto.js'
import { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import { UpdateTravelRecordDto } from './dto/update-travel-record.dto.js'
import { ImportTravelRecordsDto } from './dto/import-travel-records.dto.js'
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

  @Get('stats')
  @ApiOperation({ summary: '获取旅行统计' })
  @ApiOkResponse()
  @UseGuards(SessionAuthGuard)
  async getStats(
    @CurrentUser() user: AuthUser,
  ): Promise<TravelStatsResponse> {
    return this.recordsService.getStats(user.id)
  }

  @Get()
  @ApiOperation({ summary: '获取所有旅行记录' })
  @ApiOkResponse()
  @UseGuards(SessionAuthGuard)
  async findAll(
    @CurrentUser() user: AuthUser,
  ): Promise<ContractTravelRecord[]> {
    return this.recordsService.findAllTravel(user.id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建旅行记录' })
  @ApiCreatedResponse()
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: CreateTravelRecordDto,
  }))
  async createTravel(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateTravelRecordDto,
  ): Promise<ContractTravelRecord> {
    return this.recordsService.createTravel(user.id, body)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新旅行记录' })
  @ApiOkResponse()
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: UpdateTravelRecordDto,
  }))
  async updateTravel(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateTravelRecordDto,
  ): Promise<ContractTravelRecord> {
    return this.recordsService.updateTravelRecord(user.id, id, body)
  }

  @Post('import')
  @HttpCode(201)
  @ApiOperation({ summary: '导入本地旅行记录' })
  @ApiCreatedResponse()
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: ImportTravelRecordsDto,
  }))
  async importTravel(
    @CurrentUser() user: AuthUser,
    @Body() body: ImportTravelRecordsDto,
  ): Promise<ImportTravelRecordsResponse> {
    return this.recordsService.importTravel(user.id, body)
  }

  @Delete(':placeId')
  @HttpCode(204)
  @ApiOperation({ summary: '删除旅行记录' })
  @ApiNoContentResponse()
  @UseGuards(SessionAuthGuard)
  async deleteTravel(
    @CurrentUser() user: AuthUser,
    @Param('placeId') placeId: string,
  ): Promise<void> {
    return this.recordsService.deleteTravel(user.id, placeId)
  }

  @Delete('record/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '按记录 ID 删除单条旅行记录' })
  @ApiNoContentResponse()
  @UseGuards(SessionAuthGuard)
  async deleteTravelById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.recordsService.deleteTravelRecord(user.id, id)
  }
}
