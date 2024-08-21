import { Job } from './Job.model';

export interface StartBuildsHost {
  url: string;
  jobs: Job[];
}
