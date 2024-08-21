import { Command, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { AbstractCommand } from './abstract/abstract.command';

@Command({ name: 'start-builds', description: 'Start multiple builds' })
export class StartBuildsCommand extends AbstractCommand {
  constructor(private readonly logger: Logger) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Passed params: ${passedParams}`);
    this.logger.log(`Options: ${JSON.stringify(options)}`);
  }

  @Option({
    flags: '-yaml, --yaml-path [string]',
    description: 'Path to YAML file',
  })
  parseYamlPath(val: string): string {
    return val;
  }
}
