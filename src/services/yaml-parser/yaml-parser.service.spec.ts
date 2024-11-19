import {TestBed} from '@suites/unit';

import {YamlParserService} from './yaml-parser.service';

describe('YamlParserService', () => {
  let service: YamlParserService;

  beforeEach(async () => {
    const {unit} = await TestBed.solitary(YamlParserService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
