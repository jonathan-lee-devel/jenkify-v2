import {Parameter} from './Parameter.model';

export interface Job {
  path: string;
  buildParameters: Parameter[];
}
