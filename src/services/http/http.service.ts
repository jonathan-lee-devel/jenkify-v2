import {Injectable} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HttpService {
  async post(url: string, body: unknown): Promise<Response> {
    return axios({
      method: 'post',
      url,
      data: {
        body,
      },
    });
  }
}
