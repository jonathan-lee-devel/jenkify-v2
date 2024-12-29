export type JenkinsBuildStatus =
  | 'SUCCESS'
  | 'FAILURE'
  | 'UNSTABLE'
  | 'ABORTED'
  | 'NOT_BUILT'
  | 'IN_PROGRESS'
  | 'UNKNOWN';

export interface JenkinsSpecificBuildInformation {
  result: JenkinsBuildStatus;
  fullDisplayName: string;
}
