import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {BaseCommand} from '../base/base.command';

@Command({name: 'track-builds', description: 'Track multiple builds'})
export class TrackBuildsCommand extends BaseCommand {
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
    flags: '-yp, --yaml-path [string]',
    description: 'Path to YAML file',
    required: true,
  })
  parseYamlPath(val: string): string {
    return val;
  }
}
