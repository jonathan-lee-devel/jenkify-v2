import { Logger, Module } from '@nestjs/common';
import { StartBuildCommand } from './commands/jenkins/start-build.command';
import { StartBuildsCommand } from './commands/multi-jenkins/start-builds.command';
import { TrackBuildsCommand } from './commands/multi-jenkins/track-builds.command';

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
    TrackBuildsCommand,
  ],
})
export class AppModule {}
