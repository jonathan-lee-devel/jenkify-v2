import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AxiosBasicCredentials} from 'axios';

import {HttpService} from '../http/http.service';

@Injectable()
export class JenkinsRestApiService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getBuildInformation(host: string, path: string) {
    const auth: AxiosBasicCredentials = {
      username: this.configService.getOrThrow<string>('JENKINS_USER'),
      password: this.configService.getOrThrow<string>('JENKINS_TOKEN'),
    };
    const response = await this.httpService.get(
      auth,
      `${host}/${path}/api/json`,
    );
    if (response?.status !== HttpStatus.OK) {
      this.logger.error(`Response status not 200 OK for ${host}/${path}`);
      return;
    }
    return response.data;
  }
}
