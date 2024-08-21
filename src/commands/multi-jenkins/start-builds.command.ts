import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';
import {BaseCommand} from '../base/base.command';

interface CommandOptions {
  yamlPath: string;
  verbose: boolean;
}

@Command({name: 'start-builds', description: 'Start multiple builds'})
export class StartBuildsCommand extends BaseCommand {
  constructor(
    private readonly logger: Logger,
    private readonly yamlParserService: YamlParserService,
  ) {
    super();
  }

  async run(_passedParams: string[], options: CommandOptions): Promise<void> {
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    const yamlFileContents = await this.yamlParserService.openFile(
      options.yamlPath,
    );
    const data =
      await this.yamlParserService.parseStartBuildsYaml(yamlFileContents);
    this.logger.log(`Parsed data: ${JSON.stringify(data)}`);
  }

  @Option({
    flags: '-yaml, --yaml-path [string]',
    description: 'Path to YAML file',
    required: true,
  })
  parseYamlPath(val: string): string {
    return val;
  }
}
