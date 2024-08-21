import * as fs from 'node:fs';

import {Injectable, Logger} from '@nestjs/common';
import * as YAML from 'yaml';

import {StartBuilds} from '../../models/multi-jenkins/StartBuilds.model';

@Injectable()
export class YamlParserService {
  constructor(private readonly logger: Logger) {}

  async readFile(filePath: string): Promise<string> {
    this.logger.log(`Opening file: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  }

  async parseStartBuildsYaml(yamlFileContents: string): Promise<StartBuilds> {
    const data = await YAML.parse(yamlFileContents);
    return data as StartBuilds;
  }
}
