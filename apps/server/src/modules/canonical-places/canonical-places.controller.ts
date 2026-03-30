import {
  Body,
  Controller,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import type { CanonicalResolveResponse } from '@trip-map/contracts'

import { ConfirmCanonicalPlaceDto } from './dto/confirm-canonical-place.dto.js'
import { ResolveCanonicalPlaceDto } from './dto/resolve-canonical-place.dto.js'
import { CanonicalPlacesService } from './canonical-places.service.js'

@Controller('places')
export class CanonicalPlacesController {
  constructor(
    @Inject(CanonicalPlacesService)
    private readonly canonicalPlacesService: CanonicalPlacesService,
  ) {}

  @Post('resolve')
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
