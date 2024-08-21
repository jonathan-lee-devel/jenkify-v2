import { Command, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { BaseCommand } from '../base/base.command';
import { YamlParserService } from '../../services/yaml-parser/yaml-parser.service';

@Command({ name: 'start-builds', description: 'Start multiple builds' })
export class StartBuildsCommand extends BaseCommand {
  constructor(
    private readonly logger: Logger,
    private readonly yamlParserService: YamlParserService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Passed params: ${passedParams}`);
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    await this.yamlParserService.parseStartBuildsYaml(options.yamlPath);
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
