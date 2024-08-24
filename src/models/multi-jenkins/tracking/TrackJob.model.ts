import {Parameter} from '../Parameter.model';

export interface TrackJob {
  path: string;
  buildParameters: Parameter[];
}
