import 'reflect-metadata'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { fileURLToPath } from 'node:url'

import { AppModule } from './app.module.js'

const PORT = 4000

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  return app
}

async function bootstrap() {
  const app = await createApp()
  await app.listen(PORT, '0.0.0.0')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void bootstrap()
}
