import {TestBed} from '@automock/jest';

import {JenkinsRestApiService} from './jenkins-rest-api.service';

describe('JenkinsRestApiService', () => {
  let service: JenkinsRestApiService;

  beforeEach(async () => {
    const {unit} = TestBed.create(JenkinsRestApiService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
