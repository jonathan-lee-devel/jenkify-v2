import {Injectable, Logger} from '@nestjs/common';
import axios, {AxiosBasicCredentials, AxiosResponse} from 'axios';

@Injectable()
export class HttpService {
  constructor(private readonly logger: Logger) {}

  async get(
    auth: AxiosBasicCredentials,
    url: string,
    verbose?: boolean,
  ): Promise<AxiosResponse> {
    let response: AxiosResponse;
    if (verbose) {
      this.logger.log(`GET request to: ${url}`);
    }
    try {
      response = await axios({
        method: 'get',
        url,
        auth,
      });
    } catch (err) {
      this.logger.error(err);
    }
    return response;
  }

  async post(
    auth: AxiosBasicCredentials,
    url: string,
    body: unknown,
    verbose?: boolean,
  ): Promise<AxiosResponse> {
    let response: AxiosResponse;
    if (verbose) {
      this.logger.log(`POST request to: ${url}`);
    }
    try {
      response = await axios({
        method: 'post',
        url,
        auth,
        data: {
          body,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
    return response;
  }
}
