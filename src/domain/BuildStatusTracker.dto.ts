import {BuildStatusDto} from './BuildStatus.dto';

export class BuildStatusTrackerDto {
  private _completeOrUnrecoverableBuilds: BuildStatusDto[];

  constructor(buildStatuses: BuildStatusDto[]) {
    this._buildStatuses = buildStatuses;
    this._completeOrUnrecoverableBuilds = [];
  }

  private _buildStatuses: BuildStatusDto[];

  get buildStatuses(): BuildStatusDto[] {
    return this._buildStatuses;
  }

  set buildStatuses(value: BuildStatusDto[]) {
    this._buildStatuses = value;
  }

  get completeOrUnrecoverableBuildStatuses(): BuildStatusDto[] {
    return this._completeOrUnrecoverableBuilds;
  }

  set completeOrUnrecoverableBuildStatuses(value: BuildStatusDto[]) {
    this._completeOrUnrecoverableBuilds = value;
  }
}
