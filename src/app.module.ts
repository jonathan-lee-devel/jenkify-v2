import { Logger, Module } from '@nestjs/common';
import { StartBuildCommand } from './commands/jenkins/start-build.command';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(AppModule.name),
    },
    StartBuildCommand,
  ],
})
export class AppModule {}
