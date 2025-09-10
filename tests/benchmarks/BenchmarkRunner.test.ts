import { BenchmarkRunner } from '../../src/benchmarks/BenchmarkRunner';
import { TestScenarios } from '../../src/benchmarks/TestScenarios';

describe('BenchmarkRunner', () => {
  let runner: BenchmarkRunner;

  beforeEach(() => {
    runner = new BenchmarkRunner();
  });

  describe('Single Test Execution', () => {
    test('should run a single benchmark test', async () => {
      const scenario = TestScenarios.sequential(1000);
      
      const result = await runner.runSingleTest('LRU', scenario, {
        warmupRounds: 1,
        testRounds: 1,
        cacheSize: 100,
        collectGC: false
      });

      expect(result).toMatchObject({
        strategy: 'LRU',
        testName: 'Sequential Access',
        operations: expect.any(Number),
        duration: expect.any(Number),
        throughput: expect.any(Number),
        avgLatency: expect.any(Number),
        hitRate: expect.any(Number),
        evictions: expect.any(Number)
      });

      expect(result.duration).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.avgLatency).toBeGreaterThan(0);
    });

    test('should throw error for unknown strategy', async () => {
      const scenario = TestScenarios.sequential(100);
      
      await expect(
        runner.runSingleTest('UNKNOWN', scenario)
      ).rejects.toThrow("Strategy 'UNKNOWN' not found");
    });
  });

  describe('Custom Cache Strategies', () => {
    test('should allow adding custom cache strategies', async () => {
      const customCache = jest.fn().mockImplementation((capacity) => ({
        size: 0,
        capacity,
        get: jest.fn().mockReturnValue(undefined),
        set: jest.fn(),
        delete: jest.fn().mockReturnValue(false),
        has: jest.fn().mockReturnValue(false),
        clear: jest.fn(),
        stats: {
          hits: 0,
          misses: 1,
          evictions: 0,
          hitRate: 0
        },
        resetStats: jest.fn()
      }));

      runner.addCacheStrategy('Custom', customCache);
      
      const scenario = TestScenarios.sequential(10);
      const result = await runner.runSingleTest('Custom', scenario, {
        warmupRounds: 0,
        testRounds: 1,
        operations: 10,
        collectGC: false
      });

      expect(result.strategy).toBe('Custom');
      expect(customCache).toHaveBeenCalled();
    });
  });

  describe('Full Benchmark Suite', () => {
    test('should run multiple strategies and scenarios', async () => {
      const results = await runner.runBenchmark(
        ['LRU', 'Clock'],
        [TestScenarios.sequential(100), TestScenarios.random(100, 200)],
        {
          warmupRounds: 1,
          testRounds: 1,
          cacheSize: 50,
          collectGC: false
        }
      );

      expect(results).toHaveLength(4); // 2 strategies × 2 scenarios
      
      const strategies = [...new Set(results.map(r => r.strategy))];
      expect(strategies).toContain('LRU');
      expect(strategies).toContain('Clock');

      const testNames = [...new Set(results.map(r => r.testName))];
      expect(testNames).toContain('Sequential Access');
      expect(testNames).toContain('Random Access');

      for (const result of results) {
        expect(result.operations).toBe(100000);
        expect(result.duration).toBeGreaterThan(0);
        expect(result.throughput).toBeGreaterThan(0);
      }
    });

    test('should handle unknown strategies gracefully', async () => {
      const results = await runner.runBenchmark(
        ['LRU', 'UNKNOWN', 'Clock'],
        [TestScenarios.sequential(50)],
        {
          warmupRounds: 0,
          testRounds: 1,
          operations: 50,
          collectGC: false
        }
      );

      expect(results).toHaveLength(2); // Should skip UNKNOWN strategy
      const strategies = results.map(r => r.strategy);
      expect(strategies).toContain('LRU');
      expect(strategies).toContain('Clock');
      expect(strategies).not.toContain('UNKNOWN');
    });
  });

  describe('Result Processing', () => {
    test('should print results without throwing errors', async () => {
      const results = await runner.runBenchmark(
        ['LRU'],
        [TestScenarios.sequential(100)],
        {
          warmupRounds: 0,
          testRounds: 1,
          operations: 100,
          collectGC: false
        }
      );

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => runner.printResults(results)).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});