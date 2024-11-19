import * as fs from 'node:fs';

import {Injectable, Logger} from '@nestjs/common';
import * as YAML from 'yaml';

import {StartBuilds} from '../../models/multi-jenkins/start/StartBuilds.model';
import {TrackBuilds} from '../../models/multi-jenkins/tracking/TrackBuilds.model';

@Injectable()
export class YamlParserService {
  constructor(private readonly logger: Logger) {}

  async readFile(filePath: string): Promise<string> {
    this.logger.verbose(`Opening file: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    this.logger.verbose(`Writing to file: ${filePath}`);
    return fs.writeFileSync(filePath, content, 'utf8');
  }

  async parseStartBuildsYaml(yamlFileContents: string): Promise<StartBuilds> {
    const data = await YAML.parse(yamlFileContents);
    return data as StartBuilds;
  }

  async parseTrackBuildsYaml(yamlFileContents: string): Promise<TrackBuilds> {
    const data = await YAML.parse(yamlFileContents);
    return data as TrackBuilds;
  }
}
