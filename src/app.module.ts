import {Logger, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {StartBuildCommand} from './commands/jenkins/start-build.command';
import {StartBuildsCommand} from './commands/multi-jenkins/start-builds.command';
import {TrackBuildsCommand} from './commands/multi-jenkins/track-builds.command';
import {HttpService} from './services/http/http.service';
import {JenkinsRestApiService} from './services/jenkins-rest-api/jenkins-rest-api.service';
import {JenkinsWfApiService} from './services/jenkins-wf-api/jenkins-wf-api.service';
import {YamlParserService} from './services/yaml-parser/yaml-parser.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(AppModule.name),
    },
    StartBuildCommand,
    StartBuildsCommand,
    TrackBuildsCommand,
    HttpService,
    JenkinsRestApiService,
    JenkinsWfApiService,
    YamlParserService,
  ],
})
export class AppModule {}
