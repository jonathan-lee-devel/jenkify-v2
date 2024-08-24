import {TrackJob} from './TrackJob.model';

export interface TrackBuildsHost {
  url: string;
  jobs: TrackJob[];
}
