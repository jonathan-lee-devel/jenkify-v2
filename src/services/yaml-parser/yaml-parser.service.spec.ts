import {TestBed} from '@automock/jest';

import {YamlParserService} from './yaml-parser.service';

describe('YamlParserService', () => {
  let service: YamlParserService;

  beforeEach(async () => {
    const {unit} = TestBed.create(YamlParserService).compile();
    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
