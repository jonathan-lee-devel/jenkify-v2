import {Parameter} from '../Parameter.model';

export interface StartJob {
  path: string;
  buildParameters: Parameter[];
}
