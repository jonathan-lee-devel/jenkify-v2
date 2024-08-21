import { Logger, Module } from '@nestjs/common';
import { StartBuildCommand } from './commands/jenkins/start-build.command';
import { StartBuildsCommand } from './commands/start-builds.command';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(AppModule.name),
    },
    StartBuildCommand,
    StartBuildsCommand,
  ],
})
export class AppModule {}
