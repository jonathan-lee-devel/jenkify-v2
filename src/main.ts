import {LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {CommandFactory} from 'nest-commander';

import {AppModule} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  let loggerLevels: LogLevel[] = ['log', 'warn', 'error', 'fatal'];
  if (configService.get('VERBOSE') === true) {
    loggerLevels = [...loggerLevels, 'debug', 'verbose'];
  }
  await CommandFactory.run(AppModule, {
    logger: loggerLevels,
  });
}
bootstrap().catch((reason) => console.error(reason));
