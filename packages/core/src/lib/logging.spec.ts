import { logger as nxLogger } from '@nx/devkit';
import * as os from 'node:os';
import * as stdEnv from 'std-env';
import c from 'tinyrainbow';
import { afterEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { escapeData, logger } from './logging.js';

// Mock dependencies
vi.mock('std-env');

vi.mock('@nx/devkit', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    verbose: vi.fn(),
  },
}));

describe('logging', () => {
  let mockConsoleLog: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('escapeData', () => {
    it('should escape percent signs', () => {
      const result = escapeData('test%data');
      expect(result).toBe('test%25data');
    });

    it('should escape carriage returns', () => {
      const result = escapeData('test\rdata');
      expect(result).toBe('test%0Ddata');
    });

    it('should escape newlines', () => {
      const result = escapeData('test\ndata');
      expect(result).toBe('test%0Adata');
    });
  });

  describe('startGroup', () => {
    it('should handle GitHub Actions provider', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('github_actions');

      logger.startGroup('GitHub Group');

      expect(mockConsoleLog).toHaveBeenCalledWith(`::group::GitHub Group${os.EOL}`);
    });

    it('should handle GitLab provider', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('gitlab');

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890123);

      logger.startGroup('GitLab Group');

      const expectedTimestamp = Math.floor(1234567890123 / 1000);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `\x1b[0Ksection_start:${expectedTimestamp}:GitLab Group[collapsed=true]\r\x1b[0KGitLab Group`,
      );

      mockDateNow.mockRestore();
    });

    it('should handle unknown provider with default formatting', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('unknown' as stdEnv.ProviderName);

      logger.startGroup('Test Group');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        `${os.EOL}${c.cyan('>')} ${c.inverse(c.bold(c.cyan(` Test Group `)))}${os.EOL}`,
      );
    });
  });

  describe('endGroup', () => {
    it('should handle GitHub Actions provider', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('github_actions');

      logger.endGroup('GitHub Group');

      expect(mockConsoleLog).toHaveBeenCalledWith(`::endgroup::${os.EOL}`);
    });

    it('should handle GitLab provider', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('gitlab');

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890123);

      logger.endGroup('GitLab Group');

      const expectedTimestamp = Math.floor(1234567890123 / 1000);
      expect(mockConsoleLog).toHaveBeenCalledWith(`\x1b[0Ksection_end:${expectedTimestamp}:GitLab Group\r\x1b[0K`);

      mockDateNow.mockRestore();
    });

    it('should handle unknown provider with default formatting', () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('unknown' as stdEnv.ProviderName);

      logger.endGroup('Test Group');

      expect(mockConsoleLog).toHaveBeenCalledWith(os.EOL);
    });
  });

  describe('group', () => {
    it('should wrap function execution in a group', async () => {
      const mockFn = vi.fn().mockResolvedValue('test result');

      const result = await logger.group('Test Group', mockFn);

      expect(result).toBe('test result');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call startGroup and endGroup around function execution', async () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('github_actions');
      const mockFn = vi.fn().mockResolvedValue('test result');

      await logger.group('Test Group', mockFn);

      // Check that console methods were called (indicating startGroup and endGroup were called)
      assertWriteCalls(mockConsoleLog, [`::group::Test Group${os.EOL}`, `::endgroup::${os.EOL}`]); // startGroup and endGroup
    });

    it('should call endGroup even if function throws', async () => {
      vi.spyOn(stdEnv, 'provider', 'get').mockReturnValue('github_actions');
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(logger.group('Test Group', mockFn)).rejects.toThrow('Test error');

      // Check that console methods were called (indicating startGroup and endGroup were called)
      assertWriteCalls(mockConsoleLog, [`::group::Test Group${os.EOL}`, `::endgroup::${os.EOL}`]); // startGroup and endGroup
    });

    it('should preserve function return type', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test', count: 42 });

      const result = await logger.group('Test Group', mockFn);

      expect(result).toEqual({ data: 'test', count: 42 });
    });
  });

  it('should delegate to nx logger methods', () => {
    logger.warn('test warning');
    logger.error('test error');
    logger.info('test info');
    logger.log('test log');
    logger.debug('test debug');
    logger.fatal('test fatal');
    logger.verbose('test verbose');

    expect(nxLogger.warn).toHaveBeenCalledWith('test warning');
    expect(nxLogger.error).toHaveBeenCalledWith('test error');
    expect(nxLogger.info).toHaveBeenCalledWith('test info');
    expect(nxLogger.log).toHaveBeenCalledWith('test log');
    expect(nxLogger.debug).toHaveBeenCalledWith('test debug');
    expect(nxLogger.fatal).toHaveBeenCalledWith('test fatal');
    expect(nxLogger.verbose).toHaveBeenCalledWith('test verbose');
  });
});

function assertWriteCalls(mock: MockInstance, calls: string[]): void {
  expect(mock).toHaveBeenCalledTimes(calls.length);

  for (let i = 0; i < calls.length; i++) {
    expect(mock).toHaveBeenNthCalledWith(i + 1, calls[i]);
  }
}
