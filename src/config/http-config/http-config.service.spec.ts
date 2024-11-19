import {TestBed} from '@suites/unit';

import {HttpConfigService} from './http-config.service';

describe('HttpConfigService', () => {
  let service: HttpConfigService;

  beforeEach(async () => {
    const {unit} = await TestBed.solitary(HttpConfigService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
