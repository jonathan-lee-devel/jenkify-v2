import { Logger, Module } from '@nestjs/common';
import { StartBuildCommand } from './commands/jenkins/start-build.command';
import { StartBuildsCommand } from './commands/multi-jenkins/start-builds.command';
import { TrackBuildsCommand } from './commands/multi-jenkins/track-builds.command';
import { YamlParserService } from './services/yaml-parser/yaml-parser.service';

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
    YamlParserService,
  ],
})
export class AppModule {}
