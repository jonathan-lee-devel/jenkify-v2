import {CommandFactory} from 'nest-commander';

import {AppModule} from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    logger: ['log', 'warn', 'error', 'fatal'],
  });
}
bootstrap().catch((reason) => console.error(reason));
