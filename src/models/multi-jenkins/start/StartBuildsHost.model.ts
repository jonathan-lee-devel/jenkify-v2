import {StartJob} from './StartJob.model';

export interface StartBuildsHost {
  url: string;
  jobs: StartJob[];
}
