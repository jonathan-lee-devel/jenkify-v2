import {TestBed} from '@suites/unit';

import {JenkinsWfApiService} from './jenkins-wf-api.service';

describe('JenkinsWfApiService', () => {
  let service: JenkinsWfApiService;

  beforeEach(async () => {
    const {unit} = await TestBed.solitary(JenkinsWfApiService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
