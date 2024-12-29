import {TrackBuildsHost} from '../models/multi-jenkins/tracking/TrackBuildsHost.model';
import {TrackJob} from '../models/multi-jenkins/tracking/TrackJob.model';

export class BuildStatusDto {
  private readonly _host: TrackBuildsHost;
  private readonly _job: TrackJob;

  constructor(host: TrackBuildsHost, job: TrackJob) {
    this._host = host;
    this._job = job;
  }

  get host(): TrackBuildsHost {
    return this._host;
  }

  get job(): TrackJob {
    return this._job;
  }
}
