import {HttpModule} from '@nestjs/axios';
import {Logger, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {StartBuildCommand} from './commands/jenkins/start-build.command';
import {CompleteBuildsCommand} from './commands/multi-jenkins/complete-builds.command';
import {StartBuildsCommand} from './commands/multi-jenkins/start-builds.command';
import {TrackBuildsCommand} from './commands/multi-jenkins/track-builds.command';
import {HttpConfigService} from './config/http-config/http-config.service';
import {JenkinsRestApiService} from './services/jenkins-rest-api/jenkins-rest-api.service';
import {JenkinsWfApiService} from './services/jenkins-wf-api/jenkins-wf-api.service';
import {YamlParserService} from './services/yaml-parser/yaml-parser.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useExisting: HttpConfigService,
      extraProviders: [HttpConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger('Jenkify-v2'),
    },
    HttpConfigService,
    StartBuildCommand,
    StartBuildsCommand,
    TrackBuildsCommand,
    CompleteBuildsCommand,
    JenkinsRestApiService,
    JenkinsWfApiService,
    YamlParserService,
  ],
})
export class AppModule {}
