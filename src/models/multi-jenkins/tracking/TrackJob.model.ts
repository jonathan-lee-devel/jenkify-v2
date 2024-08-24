import {JenkinsJobStatus} from '../JenkinsJobStatus.model';
import {Parameter} from '../Parameter.model';

export interface TrackJob {
  path: string;
  buildIndex: number;
  buildParameters: Parameter[];
  status: JenkinsJobStatus;
}
