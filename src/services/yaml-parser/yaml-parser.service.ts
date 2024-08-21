import { Injectable, Logger } from '@nestjs/common';
import { StartBuilds } from '../../models/multi-jenkins/StartBuilds.model';

@Injectable()
export class YamlParserService {
  constructor(private readonly logger: Logger) {}

  async parseStartBuildsYaml(yamlFilePath: string): Promise<StartBuilds> {
    this.logger.log(`Parsing start builds YAML at path: ${yamlFilePath}`);
    return {
      hosts: [],
    };
  }
}
