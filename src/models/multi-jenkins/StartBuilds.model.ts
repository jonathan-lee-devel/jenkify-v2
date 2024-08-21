import {StartBuildsHost} from './StartBuildsHost.model';

export interface StartBuilds {
  build: {hosts: StartBuildsHost[]};
}
