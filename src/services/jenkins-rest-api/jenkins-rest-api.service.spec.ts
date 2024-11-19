import {TestBed} from '@suites/unit';

import {JenkinsRestApiService} from './jenkins-rest-api.service';

describe('JenkinsRestApiService', () => {
  let service: JenkinsRestApiService;

  beforeEach(async () => {
    const {unit} = await TestBed.solitary(JenkinsRestApiService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
