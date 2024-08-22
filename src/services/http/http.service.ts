import {Injectable, Logger} from '@nestjs/common';
import axios, {AxiosBasicCredentials, AxiosResponse} from 'axios';

@Injectable()
export class HttpService {
  constructor(private readonly logger: Logger) {}

  async get(url: string, auth?: AxiosBasicCredentials): Promise<AxiosResponse> {
    let response: AxiosResponse;
    this.logger.verbose(`GET request to: ${url}`);
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
    url: string,
    auth?: AxiosBasicCredentials,
    body?: unknown,
  ): Promise<AxiosResponse> {
    let response: AxiosResponse;
    this.logger.verbose(`POST request to: ${url}`);
    try {
      response = await axios({
        method: 'post',
        url,
        auth,
        data: body,
      });
    } catch (err) {
      this.logger.error(err);
    }
    return response;
  }
}
