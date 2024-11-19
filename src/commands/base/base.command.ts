import {CommandRunner, Option} from 'nest-commander';

export interface BaseCommandOptions {
  verbose: boolean;
}

export abstract class BaseCommand extends CommandRunner {
  @Option({
    flags: '-v, --verbose [boolean]',
    description: 'Whether to log verbosely',
    required: false,
  })
  protected parseVerbose(val: string): string {
    return val;
  }
}
