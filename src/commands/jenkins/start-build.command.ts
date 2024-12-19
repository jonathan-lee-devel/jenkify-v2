import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {BaseCommand} from '../base/base.command';

@Command({name: 'jenkins-start-build', description: 'Sample command'})
export class StartBuildCommand extends BaseCommand {
  constructor(private readonly logger: Logger) {
    super();
  }

  override async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Passed params: ${passedParams}`);
    this.logger.log(`Options: ${JSON.stringify(options)}`);
  }

  @Option({
    flags: '-ue, --url-end [string]',
    description: 'URL end for build',
  })
  parseUrlEnd(val: string): string {
    return val;
  }
}
