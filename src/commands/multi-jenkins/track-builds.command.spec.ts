import {faker} from '@faker-js/faker/locale/en';
import {Logger} from '@nestjs/common';
import {Mocked} from '@suites/doubles.jest';
import {TestBed} from '@suites/unit';

import {TrackBuildsCommand} from './track-builds.command';
import {TrackBuilds} from '../../models/multi-jenkins/tracking/TrackBuilds.model';
import {JenkinsRestApiService} from '../../services/jenkins-rest-api/jenkins-rest-api.service';
import {YamlParserService} from '../../services/yaml-parser/yaml-parser.service';

describe('TrackBuildsCommand', () => {
  let command: TrackBuildsCommand;
  let mockLogger: Mocked<Logger>;
  let mockYamlParserService: Mocked<YamlParserService>;
  let mockJenkinsRestApiService: Mocked<JenkinsRestApiService>;

  beforeEach(async () => {
    const {unit, unitRef} =
      await TestBed.solitary(TrackBuildsCommand).compile();

    command = unit;
    mockLogger = unitRef.get<Logger>(Logger);
    mockYamlParserService = unitRef.get<YamlParserService>(YamlParserService);
    mockJenkinsRestApiService = unitRef.get<JenkinsRestApiService>(
      JenkinsRestApiService,
    );
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
    expect(mockLogger).toBeDefined();
    expect(mockYamlParserService).toBeDefined();
    expect(mockJenkinsRestApiService).toBeDefined();
  });

  it('should parse options', () => {
    const yamlPath = faker.system.filePath();
    const interval = faker.number.int();
    const timeout = faker.number.int();

    const yamlVal = command.parseYamlPath(yamlPath);
    const intervalVal = command.parseInterval(interval);
    const timeoutVal = command.parseTimeout(timeout);

    expect(yamlVal).toEqual(yamlPath);
    expect(intervalVal).toEqual(interval);
    expect(timeoutVal).toEqual(timeout);
  });

  it('should log output based on input to command', async () => {
    const yamlPath = faker.system.filePath();
    const interval = faker.number.int();
    const timeout = faker.number.int();
    const verbose = faker.datatype.boolean();
    const trackBuilds: TrackBuilds = {
      build: {
        hosts: [],
      },
    };

    mockYamlParserService.readFile.mockResolvedValue(faker.lorem.paragraphs());
    mockYamlParserService.parseTrackBuildsYaml.mockResolvedValue(trackBuilds);

    await command.run([], {
      timeout,
      interval,
      yamlPath,
      verbose,
    });

    expect(mockLogger.log).toHaveBeenCalledWith(
      `Options: ${JSON.stringify({
        timeout,
        interval,
        yamlPath,
        verbose,
      })}`,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Total # jobs to track and process: ${trackBuilds.build.hosts.length}`,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Tracking interval: ${interval}ms`,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Tracking timeout: ${timeout}s`,
    );
  });
});
