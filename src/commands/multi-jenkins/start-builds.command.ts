import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';

import {JenkinsBuildInformation} from '../../models/jenkins-rest-api/JenkinsBuildInformation.model';
import {StartBuildsHost} from '../../models/multi-jenkins/start/StartBuildsHost.model';
import {StartJob} from '../../models/multi-jenkins/start/StartJob.model';
import {TrackBuilds} from '../../models/multi-jenkins/tracking/TrackBuilds.model';
import {TrackBuildsHost} from '../../models/multi-jenkins/tracking/TrackBuildsHost.model';
import {TrackJob} from '../../models/multi-jenkins/tracking/TrackJob.model';
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

  override async run(
    _passedParams: string[],
    options: CommandOptions,
  ): Promise<void> {
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    this.logger.log(options.verbose);
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
    );
    const startBuilds =
      await this.yamlParserService.parseStartBuildsYaml(yamlFileContents);
    const buildIndexMap: Map<string, number> = new Map<string, number>();
    for (const host of startBuilds.build.hosts) {
      this.logger.verbose(`Processing host: ${JSON.stringify(host)}`);
      for (const job of host.jobs) {
        const response = await this.processJob(host, job);
        if (response?.buildResponse?.isSuccessfullyKickedOff) {
          buildIndexMap.set(
            `${host.url}/${job.path}`,
            response.mostRecentBuildNumber + 1,
          );
          this.logger.log(
            `${job.path} started successfully with build number: #${response?.mostRecentBuildNumber}`,
          );
        } else {
          this.logger.error(
            `Failed to kick off build for ${job.path} on ${host.url}`,
          );
        }
      }
    }
    this.logger.log('Build index map:');
    for (const [key, value] of buildIndexMap) {
      this.logger.log(`${key} => ${value}`);
    }
    const trackBuilds: TrackBuilds = {
      build: {
        hosts: [
          ...startBuilds.build.hosts.map((startHost): TrackBuildsHost => {
            return {
              url: startHost.url,
              jobs: [
                ...startHost.jobs.map((startJob): TrackJob => {
                  return {
                    path: startJob.path,
                    buildParameters: startJob.buildParameters,
                    status: 'UNKNOWN',
                    buildIndex:
                      buildIndexMap.get(`${startHost.url}/${startJob.path}`) ??
                      -1,
                  };
                }),
              ],
            };
          }),
        ],
      },
    };
    for (const host of trackBuilds.build.hosts) {
      host.jobs = host.jobs.filter((job) => job.buildIndex !== -1);
    }
    await this.yamlParserService.writeYamlFile(
      options.yamlPath.replace('.yaml', '-tracking.yaml'),
      trackBuilds,
    );
    this.logger.log('Start builds complete');
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
