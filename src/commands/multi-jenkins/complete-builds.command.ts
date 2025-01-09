import {Logger} from '@nestjs/common';
import {Command, Option} from 'nest-commander';
import {finalize, interval, startWith, Subject, takeUntil, tap} from 'rxjs';

import {JenkinsBuildInformation} from '../../models/jenkins-rest-api/JenkinsBuildInformation.model';
import {JenkinsBuildStatus} from '../../models/jenkins-rest-api/JenkinsSpecificBuildInformation.model';
import {StartBuildsHost} from '../../models/multi-jenkins/start/StartBuildsHost.model';
import {StartJob} from '../../models/multi-jenkins/start/StartJob.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';
import {BaseCommand, BaseCommandOptions} from '../base/base.command';

interface JobCollection {
  [jobName: string]: JobLifetimeData;
}

interface JobLifetimeData {
  jobPath: string;
  hostUrl: string;
  buildNumber: number;
  status: JenkinsBuildStatus;
  isInitialized: boolean;
  isCompleteOrUnrecoverable: boolean;
  numberOfAttempts: number;
}

interface CommandOptions extends BaseCommandOptions {
  yamlPath: string;
  interval: number;
  timeout: number;
}

@Command({
  name: 'complete-builds',
  description: 'Kick off multiple builds and track to completion',
})
export class CompleteBuildsCommand extends BaseCommand {
  private readonly completeTracking: Subject<void>;
  private readonly jobCollection: JobCollection = {};

  constructor(
    private readonly logger: Logger,
    private readonly yamlParserService: YamlParserService,
    private readonly jenkinsRestApiService: JenkinsRestApiService,
  ) {
    super();
    this.completeTracking = new Subject<void>();
  }

  override async run(
    _passedParams: string[],
    options: CommandOptions,
  ): Promise<void> {
    this.logger.log(
      `Kicking off builds and tracking to completion... Options: ${JSON.stringify(options)}`,
    );
    const yamlFileContents = await this.yamlParserService.readFile(
      options.yamlPath,
    );
    const startBuilds =
      await this.yamlParserService.parseStartBuildsYaml(yamlFileContents);

    const totalNumberOfBuildsToProcess = startBuilds.build.hosts.reduce(
      (previousValue, currentValue) => {
        return previousValue + currentValue.jobs.length;
      },
      0,
    );

    this.logger.log(
      `Total number of builds to process: ${totalNumberOfBuildsToProcess}`,
    );

    this.logger.log(`Kicking off builds...`);
    for (const host of startBuilds.build.hosts) {
      for (const job of host.jobs) {
        await this.startBuildAndAddToCollection(host, job);
      }
    }

    for (const jobData of Object.values(this.jobCollection).filter(
      (jobData) => !jobData.isInitialized,
    )) {
      this.logger.log(
        `Job: ${jobData.jobPath} on ${jobData.hostUrl} with build number: #${jobData.buildNumber} will not be started because it could not be initialized`,
      );
    }

    let intervalCount = 0;
    interval(options.interval)
      .pipe(
        startWith(0),
        takeUntil(this.completeTracking),
        tap(async () => {
          if (intervalCount * options.interval >= options.timeout * 1000) {
            await this.completeTrackingViaSubjectWithLogMessage(
              `Tracking timeout of ${options.timeout}s reached`,
            );
            return;
          }

          for (const jobData of Object.values(this.jobCollection)) {
            if (jobData.isCompleteOrUnrecoverable || !jobData.isInitialized) {
              continue;
            }
            const buildInfo =
              await this.jenkinsRestApiService.getSpecificBuildInformation(
                jobData.hostUrl,
                jobData.jobPath,
                jobData.buildNumber,
              );
            if (!buildInfo || !buildInfo?.result) {
              jobData.numberOfAttempts++;
              this.logger.log(
                `No build info found for ${jobData.jobPath} ${jobData.buildNumber} on ${jobData.hostUrl} on this attempt #${jobData.numberOfAttempts}`,
              );
              continue;
            }
            jobData.status = buildInfo.result;
            if (
              buildInfo.result === 'SUCCESS' ||
              buildInfo.result === 'UNSTABLE' ||
              buildInfo.result === 'ABORTED'
            ) {
              this.logger.log(
                `Job complete or unrecoverable: ${jobData.jobPath} with status: ${buildInfo.result}`,
              );
              jobData.isCompleteOrUnrecoverable = true;
            }
          }

          intervalCount++;

          const numberOfCompletedOrUnrecoverableBuilds = Object.values(
            this.jobCollection,
          ).filter(
            (jobData) =>
              jobData.isCompleteOrUnrecoverable || !jobData.isInitialized,
          ).length;
          this.logger.log(
            `Tracking progress: ${numberOfCompletedOrUnrecoverableBuilds}/${totalNumberOfBuildsToProcess} complete, unrecoverable, or uninitialized builds`,
          );
          if (
            numberOfCompletedOrUnrecoverableBuilds ===
              totalNumberOfBuildsToProcess &&
            intervalCount > 0
          ) {
            await this.completeTrackingViaSubjectWithLogMessage(
              `Reached maximum number (${totalNumberOfBuildsToProcess}) complete or unrecoverable`,
            );
            return;
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

  private async startBuildAndAddToCollection(
    host: StartBuildsHost,
    job: StartJob,
  ): Promise<void> {
    let isInitialized = false;
    const jobData: JobLifetimeData = {
      jobPath: job.path,
      hostUrl: host.url,
      buildNumber: -1,
      status: 'UNKNOWN',
      isInitialized,
      isCompleteOrUnrecoverable: false,
      numberOfAttempts: 0,
    };
    let jobInfo: JenkinsBuildInformation;
    try {
      jobInfo = await this.jenkinsRestApiService.getBuildInformation(
        host.url,
        job.path,
      );

      jobData.buildNumber = (jobInfo?.lastBuild?.number ?? -2) + 1;

      const build = await this.jenkinsRestApiService.kickOffBuild(
        host.url,
        job.path,
        job.buildParameters,
      );

      isInitialized = build?.isSuccessfullyKickedOff ?? false;
    } catch (err) {
      this.logger.error(err);
      isInitialized = false;
    } finally {
      jobData.isInitialized = isInitialized;
      this.jobCollection[job.path] = jobData;
    }
  }

  private async completeTrackingViaSubjectWithLogMessage(message: string) {
    this.logger.log(message);
    this.completeTracking.next();
    this.completeTracking.complete();
  }
}
