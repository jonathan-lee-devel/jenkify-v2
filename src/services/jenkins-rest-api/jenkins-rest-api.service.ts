import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AxiosBasicCredentials} from 'axios';

import {JenkinsBuildInformation} from '../../models/jenkins-rest-api/JenkinsBuildInformation.model';
import {Parameter} from '../../models/multi-jenkins/Parameter.model';
import {HttpService} from '../http/http.service';

@Injectable()
export class JenkinsRestApiService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getBuildInformation(
    host: string,
    path: string,
  ): Promise<JenkinsBuildInformation | null> {
    const auth: AxiosBasicCredentials = {
      username: this.configService.getOrThrow<string>('JENKINS_USER'),
      password: this.configService.getOrThrow<string>('JENKINS_TOKEN'),
    };
    const response = await this.httpService.get(
      `${host}/${path}/api/json`,
      auth,
    );
    if (response?.status !== HttpStatus.OK) {
      this.logger.error(`Response status not 200 OK for ${host}/${path}`);
      return null;
    }
    return response.data as JenkinsBuildInformation;
  }

  async kickOffBuild(
    host: string,
    path: string,
    buildParameters?: Parameter[],
  ): Promise<{isSuccessfullyKickedOff: boolean}> {
    const auth: AxiosBasicCredentials = {
      username: this.configService.getOrThrow<string>('JENKINS_USER'),
      password: this.configService.getOrThrow<string>('JENKINS_TOKEN'),
    };
    let buildPath: string = '';
    if (buildParameters && buildParameters.length > 0) {
      const object = {};
      buildParameters.forEach((mappedBuildParameter) => {
        object[mappedBuildParameter.name] = mappedBuildParameter.value;
      });
      const queryParams = new URLSearchParams(object);
      buildPath = `WithParameters?${queryParams.toString()}`;
    }
    const response = await this.httpService.post(
      `${host}/${path}/build${buildPath}`,
      auth,
    );
    if (response?.status !== HttpStatus.CREATED) {
      this.logger.error(`Failed to kick off build for ${host}/${path}`);
      return {isSuccessfullyKickedOff: false};
    }
    this.logger.log(`Kicked off build for ${host}/${path}`);
    return {isSuccessfullyKickedOff: true};
  }
}
