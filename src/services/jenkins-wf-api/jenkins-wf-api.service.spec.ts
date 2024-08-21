import {TestBed} from '@automock/jest';

import {JenkinsWfApiService} from './jenkins-wf-api.service';

describe('JenkinsWfApiService', () => {
  let service: JenkinsWfApiService;

  beforeEach(async () => {
    const {unit} = TestBed.create(JenkinsWfApiService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
