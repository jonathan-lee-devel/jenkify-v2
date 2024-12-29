import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';
import {finalize, interval, startWith, Subject, takeUntil, tap} from 'rxjs';

import {BuildStatusDto} from '../../domain/BuildStatus.dto';
import {BuildStatusTrackerDto} from '../../domain/BuildStatusTracker.dto';
import {JenkinsSpecificBuildInformation} from '../../models/jenkins-rest-api/JenkinsSpecificBuildInformation.model';
import {TrackBuilds} from '../../models/multi-jenkins/tracking/TrackBuilds.model';
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
    this.logger.log(`Tracking interval: ${options.interval}ms`);
    this.logger.log(`Tracking timeout: ${options.timeout}s`);
    const buildStatusTracker = this.generateBuildStatusTrackerDto(trackBuilds);
    let intervalCount = 0;
    interval(options.interval)
      .pipe(
        startWith(0),
        takeUntil(this.completeTracking),
        tap(() => {
          const newBuildStatuses: BuildStatusDto[] = [];
          buildStatusTracker.buildStatuses.forEach(async (buildStatus) => {
            const isCompleteOrUnrecoverable = await this.processJob(
              buildStatus.host,
              buildStatus.job,
            );
            if (!isCompleteOrUnrecoverable) {
              newBuildStatuses.push(buildStatus);
            } else {
              buildStatusTracker.completeOrUnrecoverableBuildStatuses =
                Array.from(
                  new Set([
                    ...buildStatusTracker.completeOrUnrecoverableBuildStatuses,
                    buildStatus,
                  ]),
                );
            }
          });
          buildStatusTracker.buildStatuses = newBuildStatuses;
          this.logger.log(
            `Tracking progress: ${buildStatusTracker.completeOrUnrecoverableBuildStatuses.length ?? 0}/${totalToProcess}`,
          );
        }),
        tap(() => {
          if (
            buildStatusTracker.completeOrUnrecoverableBuildStatuses.length ===
            totalToProcess
          ) {
            this.completeTracking.next(true);
            this.completeTracking.complete();
          }
        }),
        tap(() => intervalCount++),
        tap(() => {
          if (intervalCount * options.interval >= options.timeout * 1000) {
            this.logger.error(
              `Tracking timeout of ${options.timeout}s reached`,
            );
            this.completeTracking.next(true);
            this.completeTracking.complete();
          }
        }),
        finalize(() => {
          this.logger.log('Tracking complete');
        }),
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
    description: 'Timeout in seconds',
    required: true,
  })
  parseTimeout(val: number): number {
    return val;
  }

  private async processJob(
    host: TrackBuildsHost,
    job: TrackJob,
  ): Promise<boolean> {
    let buildInfo: JenkinsSpecificBuildInformation;
    try {
      buildInfo = await this.jenkinsRestApiService.getSpecificBuildInformation(
        host.url,
        job.path,
        job.buildIndex,
      );
    } catch (err) {
      this.logger.error(err);
      return false;
    }
    if (!buildInfo || !buildInfo?.result) {
      this.logger.log(
        `No build info found for ${job.path} ${job.buildIndex} on ${host.url} on this attempt`,
      );
      return false;
    }
    if (
      buildInfo.result === 'SUCCESS' ||
      buildInfo.result === 'UNSTABLE' ||
      buildInfo.result === 'ABORTED'
    ) {
      this.logger.log(`Build ${job.path} on ${host.url} ${buildInfo.result}`);
      return true;
    }

    return false;
  }

  private generateBuildStatusTrackerDto(
    trackBuilds: TrackBuilds,
  ): BuildStatusTrackerDto {
    const buildStatuses: BuildStatusDto[] = [];
    for (const host of trackBuilds.build.hosts) {
      for (const job of host.jobs) {
        buildStatuses.push(new BuildStatusDto(host, job));
      }
    }
    return new BuildStatusTrackerDto(buildStatuses);
  }
}
