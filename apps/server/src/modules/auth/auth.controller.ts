import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthBootstrapResponse, LoginResponse, RegisterResponse } from '@trip-map/contracts'

import { LoginDto } from './dto/login.dto.js'
import { RegisterDto } from './dto/register.dto.js'
import { AuthService, SESSION_MAX_AGE_SECONDS } from './auth.service.js'

const SESSION_COOKIE_NAME = 'sid'

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === 'production',
  }
}

function clearSessionCookie(reply: FastifyReply) {
  reply.setCookie(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  })
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: '注册新账号并建立当前设备会话' })
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: RegisterDto,
  }))
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<RegisterResponse> {
    const result = await this.authService.register(body)
    reply.setCookie(SESSION_COOKIE_NAME, result.sessionId, getSessionCookieOptions())
    return { user: result.user }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '登录并建立当前设备会话' })
  @ApiOkResponse()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    expectedType: LoginDto,
  }))
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(body)
    reply.setCookie(SESSION_COOKIE_NAME, result.sessionId, getSessionCookieOptions())
    return { user: result.user }
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: '退出当前设备会话' })
  @ApiNoContentResponse()
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    await this.authService.logout(request.cookies?.[SESSION_COOKIE_NAME])
    clearSessionCookie(reply)
  }

  @Get('bootstrap')
  @HttpCode(200)
  @ApiOperation({ summary: '按当前设备 sid 恢复账号与 records 快照' })
  @ApiOkResponse()
  async bootstrap(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthBootstrapResponse> {
    const result = await this.authService.bootstrap(request.cookies?.[SESSION_COOKIE_NAME])

    if (result.clearSessionCookie) {
      clearSessionCookie(reply)
    }

    return result.response
  }
}
