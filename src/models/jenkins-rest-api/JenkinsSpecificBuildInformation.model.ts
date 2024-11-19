export type JenkinsBuildStatus =
  | 'SUCCESS'
  | 'FAILURE'
  | 'UNSTABLE'
  | 'ABORTED'
  | 'NOT_BUILT';

export interface JenkinsSpecificBuildInformation {
  result: JenkinsBuildStatus;
  fullDisplayName: string;
}
