import { CommandRunner, Option } from 'nest-commander';

export abstract class AbstractCommand extends CommandRunner {
  @Option({
    flags: '-v, --verbose [boolean]',
    description: 'Whether or not to enable verbose logging',
  })
  parseVerbose(val: boolean): boolean {
    return val;
  }
}