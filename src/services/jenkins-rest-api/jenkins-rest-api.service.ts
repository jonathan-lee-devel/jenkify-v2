import {HttpService} from '@nestjs/axios';
import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {AxiosResponse} from 'axios';
import {catchError, firstValueFrom, of} from 'rxjs';

import {JenkinsBuildInformation} from '../../models/jenkins-rest-api/JenkinsBuildInformation.model';
import {JenkinsSpecificBuildInformation} from '../../models/jenkins-rest-api/JenkinsSpecificBuildInformation.model';
import {Parameter} from '../../models/multi-jenkins/Parameter.model';

@Injectable()
export class JenkinsRestApiService {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {}

  async getBuildInformation(
    host: string,
    path: string,
  ): Promise<JenkinsBuildInformation | null> {
    const response = await firstValueFrom(
      this.httpService.get(`${host}/${path}/api/json`).pipe(
        catchError((err) => {
          this.logger.verbose(
            `Failed to get build information for ${host}/${path}`,
            err,
          );
          return of(null);
        }),
      ),
    );
    if (response?.status !== HttpStatus.OK) {
      this.logger.verbose(`Response status not 200 OK for ${host}/${path}`);
      return null;
    }
    return response.data as JenkinsBuildInformation;
  }

  async getSpecificBuildInformation(
    host: string,
    path: string,
    buildNumber: number,
  ) {
    const response = await firstValueFrom(
      this.httpService.get(`${host}/${path}/${buildNumber}/api/json`).pipe(
        catchError((err) => {
          this.logger.verbose(
            `Failed to get build information for ${host}/${path}/${buildNumber}`,
            err,
          );
          return of(null);
        }),
      ),
    );
    return response?.data as JenkinsSpecificBuildInformation;
  }

  async kickOffBuild(
    host: string,
    path: string,
    buildParameters?: Parameter[],
  ): Promise<{isSuccessfullyKickedOff: boolean}> {
    let buildPath: string = '';
    if (buildParameters && buildParameters.length > 0) {
      const object = {};
      buildParameters.forEach((mappedBuildParameter) => {
        object[mappedBuildParameter.name] = mappedBuildParameter.value;
      });
      const queryParams = new URLSearchParams(object);
      buildPath = `WithParameters?${queryParams.toString()}`;
    }
    const response = (await firstValueFrom(
      this.httpService.post(`${host}/${path}/build${buildPath}`).pipe(
        catchError((err) => {
          this.logger.verbose(
            `Failed to kick off build: ${host}/${path}/build${buildPath}`,
            err,
          );
          return of(null);
        }),
      ),
    )) as AxiosResponse<unknown>;
    if (response?.status !== HttpStatus.CREATED) {
      this.logger.verbose(`Failed to kick off build for ${host}/${path}`);
      return {isSuccessfullyKickedOff: false};
    }
    this.logger.log(`Kicked off build for ${host}/${path}`);
    return {isSuccessfullyKickedOff: true};
  }
}
