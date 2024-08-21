import {Injectable, Logger} from '@nestjs/common';
import axios, {AxiosBasicCredentials, AxiosResponse} from 'axios';

@Injectable()
export class HttpService {
  constructor(private readonly logger: Logger) {}

  async get(auth: AxiosBasicCredentials, url: string): Promise<AxiosResponse> {
    let response: AxiosResponse;
    this.logger.log(`Getting response from ${url}`);
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
  ): Promise<AxiosResponse> {
    let response: AxiosResponse;
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
