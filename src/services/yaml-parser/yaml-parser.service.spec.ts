import { Test, TestingModule } from '@nestjs/testing';
import { YamlParserService } from './yaml-parser.service';

describe('YamlParserService', () => {
  let service: YamlParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YamlParserService],
    }).compile();

    service = module.get<YamlParserService>(YamlParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
