import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {Job} from '../../models/multi-jenkins/Job.model';
import {StartBuildsHost} from '../../models/multi-jenkins/StartBuildsHost.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
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
    private readonly jenkinsRestApiService: JenkinsRestApiService,
  ) {
    super();
  }

  async run(_passedParams: string[], options: CommandOptions): Promise<void> {
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
      options.verbose,
    );
    const startBuilds =
      await this.yamlParserService.parseStartBuildsYaml(yamlFileContents);
    startBuilds.build.hosts.forEach((host) => {
      if (options.verbose) {
        this.logger.log(`Processing host: ${JSON.stringify(host)}`);
      }
      host.jobs.forEach(async (job) => await this.processJob(host, job));
    });
  }

  @Option({
    flags: '-yaml, --yaml-path [string]',
    description: 'Path to YAML file',
    required: true,
  })
  parseYamlPath(val: string): string {
    return val;
  }

  private async processJob(host: StartBuildsHost, job: Job) {
    const jobInfo = await this.jenkinsRestApiService.getBuildInformation(
      host.url,
      job.path,
    );
    if (jobInfo) {
      this.logger.log(
        `Job info retrieved: ${JSON.stringify(jobInfo?.lastBuild)}`,
      );
    }
  }
}
