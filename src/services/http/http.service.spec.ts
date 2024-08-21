import {TestBed} from '@automock/jest';

import {HttpService} from './http.service';

describe('HttpService', () => {
  let service: HttpService;

  beforeEach(async () => {
    const {unit} = TestBed.create(HttpService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
