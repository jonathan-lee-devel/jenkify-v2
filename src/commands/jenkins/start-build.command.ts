import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';

@Command({ name: 'start-build', description: 'Sample command' })
export class StartBuildCommand extends CommandRunner {
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
    flags: '-ue, --url-end [string]',
    description: 'URL end for build',
  })
  parseUrlEnd(val: string): string {
    return val;
  }
}
