import {HttpModuleOptions, HttpModuleOptionsFactory} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
    return {
      auth: {
        username: this.configService.getOrThrow<string>('JENKINS_USER'),
        password: this.configService.getOrThrow<string>('JENKINS_TOKEN'),
      },
    };
  }
}
