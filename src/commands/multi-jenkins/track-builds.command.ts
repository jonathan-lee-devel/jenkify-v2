import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';
import {finalize, interval, startWith, Subject, takeUntil, tap} from 'rxjs';

import {JenkinsSpecificBuildInformation} from '../../models/jenkins-rest-api/JenkinsSpecificBuildInformation.model';
import {TrackBuildsHost} from '../../models/multi-jenkins/tracking/TrackBuildsHost.model';
import {TrackJob} from '../../models/multi-jenkins/tracking/TrackJob.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';
import {BaseCommand, BaseCommandOptions} from '../base/base.command';

interface CommandOptions extends BaseCommandOptions {
  yamlPath: string;
  interval: number;
  timeout: number;
}

@Command({name: 'track-builds', description: 'Track multiple builds'})
export class TrackBuildsCommand extends BaseCommand {
  private readonly completeTracking: Subject<boolean>;

  constructor(
    private readonly logger: Logger,
    private readonly yamlParserService: YamlParserService,
    private readonly jenkinsRestApiService: JenkinsRestApiService,
  ) {
    super();
    this.completeTracking = new Subject<boolean>();
  }

  override async run(
    _passedParams: string[],
    options: CommandOptions,
  ): Promise<void> {
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
    );
    const trackBuilds =
      await this.yamlParserService.parseTrackBuildsYaml(yamlFileContents);
    const totalToProcess = trackBuilds.build.hosts.reduce(
      (previousValue, currentValue) => {
        return previousValue + currentValue.jobs.length;
      },
      0,
    );
    this.logger.log(`Total # jobs to track and process: ${totalToProcess}`);
    let intervalCounter = 0;
    interval(options.interval)
      .pipe(
        startWith(0),
        finalize(() => this.logger.log('Tracking complete')),
        takeUntil(this.completeTracking),
        tap(() => {
          let count = 0;
          trackBuilds.build.hosts.forEach((host) => {
            this.logger.verbose(`Processing host: ${JSON.stringify(host)}`);
            host.jobs.forEach(async (job) => {
              const response = await this.processJob(host, job);
              if (!response) {
                if (intervalCounter > options.timeout / options.interval - 1) {
                  count++;
                  this.completeTrackingIfCountReached(count, totalToProcess);
                }
                return;
              }
              this.logger.log(
                `Job ${response.fullDisplayName} is status: ${response.result}`,
              );
              if (
                !response?.result ||
                response.result === 'IN_PROGRESS' ||
                response.result === 'UNKNOWN'
              ) {
                return;
              }
              count++;
              this.completeTrackingIfCountReached(count, totalToProcess);
            });
          });
        }),
        tap(() => intervalCounter++),
      )
      .subscribe();
  }

  @Option({
    flags: '-yp, --yaml-path [string]',
    description: 'Path to YAML file',
    required: true,
  })
  parseYamlPath(val: string): string {
    return val;
  }

  @Option({
    flags: '-i, --interval [number]',
    description: 'Interval in milliseconds',
    required: true,
  })
  parseInterval(val: number): number {
    return val;
  }

  @Option({
    flags: '-t, --timeout [number]',
    description: 'Timeout in milliseconds',
    required: true,
  })
  parseTimeout(val: number): number {
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

  private completeTrackingIfCountReached(
    count: number,
    totalToProcess: number,
  ) {
    if (count === totalToProcess) {
      this.completeTracking.next(true);
      this.completeTracking.complete();
    }
  }
}
