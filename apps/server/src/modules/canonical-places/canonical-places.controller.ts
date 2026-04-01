import {
  Body,
  Controller,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { CanonicalResolveResponse } from '@trip-map/contracts'

import { ConfirmCanonicalPlaceDto } from './dto/confirm-canonical-place.dto.js'
import { ResolveCanonicalPlaceDto } from './dto/resolve-canonical-place.dto.js'
import { CanonicalPlacesService } from './canonical-places.service.js'

@ApiTags('canonical-places')
@Controller('places')
export class CanonicalPlacesController {
  constructor(
    @Inject(CanonicalPlacesService)
    private readonly canonicalPlacesService: CanonicalPlacesService,
  ) {}

  @Post('resolve')
  @ApiOperation({ summary: '解析候选地点' })
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: ResolveCanonicalPlaceDto,
  }))
  async resolve(
    @Body() body: ResolveCanonicalPlaceDto,
  ): Promise<CanonicalResolveResponse> {
    return this.canonicalPlacesService.resolve(body)
  }

  @Post('confirm')
  @ApiOperation({ summary: '确认地点' })
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: ConfirmCanonicalPlaceDto,
  }))
  async confirm(
    @Body() body: ConfirmCanonicalPlaceDto,
  ): Promise<CanonicalResolveResponse> {
    return this.canonicalPlacesService.confirm(body)
  }
}
