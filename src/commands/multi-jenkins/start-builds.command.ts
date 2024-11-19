import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {JenkinsBuildInformation} from '../../models/jenkins-rest-api/JenkinsBuildInformation.model';
import {StartBuildsHost} from '../../models/multi-jenkins/start/StartBuildsHost.model';
import {StartJob} from '../../models/multi-jenkins/start/StartJob.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';
import {BaseCommand, BaseCommandOptions} from '../base/base.command';

interface CommandOptions extends BaseCommandOptions {
  yamlPath: string;
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
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    this.logger.log(options.verbose);
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
    );
    const startBuilds =
      await this.yamlParserService.parseStartBuildsYaml(yamlFileContents);
    startBuilds.build.hosts.forEach((host) => {
      this.logger.verbose(`Processing host: ${JSON.stringify(host)}`);
      host.jobs.forEach(async (job) => {
        const response = await this.processJob(host, job);
        if (response?.buildResponse?.isSuccessfullyKickedOff) {
          this.logger.log(
            `${job.path} started successfully with build number: #${response?.mostRecentBuildNumber}`,
          );
        } else {
          this.logger.error(
            `Failed to kick off build for ${job.path} on ${host.url}`,
          );
        }
      });
    });
  }

  @Option({
    flags: '-yp, --yaml-path [string]',
    description: 'Path to YAML file',
    required: true,
  })
  parseYamlPath(val: string): string {
    return val;
  }

  private async processJob(
    host: StartBuildsHost,
    job: StartJob,
  ): Promise<{
    buildResponse: {isSuccessfullyKickedOff: boolean};
    mostRecentBuildNumber: number;
  }> {
    let jobInfo: JenkinsBuildInformation;
    try {
      jobInfo = await this.jenkinsRestApiService.getBuildInformation(
        host.url,
        job.path,
      );
    } catch (err) {
      this.logger.error(err);
    }
    if (!jobInfo?.lastBuild) {
      return;
    }
    this.logger.verbose(
      `Job info retrieved: ${JSON.stringify(jobInfo.lastBuild ?? {})}`,
    );
    return {
      mostRecentBuildNumber: jobInfo.lastBuild.number,
      buildResponse: await this.jenkinsRestApiService.kickOffBuild(
        host.url,
        job.path,
        job.buildParameters,
      ),
    };
  }
}
