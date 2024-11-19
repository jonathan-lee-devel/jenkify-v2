import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {JenkinsSpecificBuildInformation} from '../../models/jenkins-rest-api/JenkinsSpecificBuildInformation.model';
import {TrackBuildsHost} from '../../models/multi-jenkins/tracking/TrackBuildsHost.model';
import {TrackJob} from '../../models/multi-jenkins/tracking/TrackJob.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';
import {BaseCommand, BaseCommandOptions} from '../base/base.command';

interface CommandOptions extends BaseCommandOptions {
  yamlPath: string;
}

@Command({name: 'track-builds', description: 'Track multiple builds'})
export class TrackBuildsCommand extends BaseCommand {
  constructor(
    private readonly logger: Logger,
    private readonly yamlParserService: YamlParserService,
    private readonly jenkinsRestApiService: JenkinsRestApiService,
  ) {
    super();
  }

  async run(_passedParams: string[], options: CommandOptions): Promise<void> {
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
    );
    const trackBuilds =
      await this.yamlParserService.parseTrackBuildsYaml(yamlFileContents);
    trackBuilds.build.hosts.forEach((host) => {
      this.logger.verbose(`Processing host: ${JSON.stringify(host)}`);
      host.jobs.forEach(async (job) => {
        const response = await this.processJob(host, job);
        if (!response) {
          return;
        }
        if (response.result === 'SUCCESS') {
          this.logger.log(`Job ${response.fullDisplayName} succeeded`);
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
    host: TrackBuildsHost,
    job: TrackJob,
  ): Promise<JenkinsSpecificBuildInformation | null> {
    let data: JenkinsSpecificBuildInformation;
    try {
      data = await this.jenkinsRestApiService.getSpecificBuildInformation(
        host.url,
        job.path,
        job.buildIndex,
      );
    } catch (err) {
      this.logger.error(err);
    }
    return data as JenkinsSpecificBuildInformation;
  }
}
