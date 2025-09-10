import { CacheWithStats } from '../cache/base/Cache';
import { LRUCache, ClockCache, LRUKCache } from '../cache/strategies';
import { PerformanceMetrics, PerformanceResult, BenchmarkOptions } from './PerformanceMetrics';
import { TestScenarios, TestScenario } from './TestScenarios';

export type CacheFactory<K, V> = (capacity: number) => CacheWithStats<K, V>;

export class BenchmarkRunner {
  private static readonly DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
    warmupRounds: 3,
    testRounds: 5,
    operations: 100000,
    cacheSize: 1000,
    keyRange: 50000,
    collectGC: true
  };

  private cacheFactories = new Map<string, CacheFactory<number, string>>([
    ['LRU', (capacity) => new LRUCache<number, string>(capacity)],
    ['Clock', (capacity) => new ClockCache<number, string>(capacity)],
    ['LRU-2', (capacity) => new LRUKCache<number, string>(capacity, 2)],
    ['LRU-3', (capacity) => new LRUKCache<number, string>(capacity, 3)],
  ]);

  addCacheStrategy(name: string, factory: CacheFactory<number, string>): void {
    this.cacheFactories.set(name, factory);
  }

  async runBenchmark(
    strategies?: string[],
    scenarios?: TestScenario[],
    options: BenchmarkOptions = {}
  ): Promise<PerformanceResult[]> {
    const config = { ...BenchmarkRunner.DEFAULT_OPTIONS, ...options };
    const results: PerformanceResult[] = [];
    
    const strategiesToTest = strategies || Array.from(this.cacheFactories.keys());
    const scenariosToTest = scenarios || TestScenarios.getAllScenarios(config.operations, config.keyRange);

    console.log(`Running benchmarks with ${strategiesToTest.length} strategies and ${scenariosToTest.length} scenarios...`);
    console.log(`Warmup rounds: ${config.warmupRounds}, Test rounds: ${config.testRounds}`);
    console.log(`Operations per test: ${config.operations.toLocaleString()}, Cache size: ${config.cacheSize.toLocaleString()}`);

    for (const strategyName of strategiesToTest) {
      const factory = this.cacheFactories.get(strategyName);
      if (!factory) {
        console.warn(`Strategy '${strategyName}' not found, skipping...`);
        continue;
      }

      console.log(`\nTesting ${strategyName}...`);

      for (const scenario of scenariosToTest) {
        process.stdout.write(`  ${scenario.name}... `);
        
        const scenarioResults = await this.runScenarioBenchmark(
          strategyName,
          factory,
          scenario,
          config
        );
        
        results.push(scenarioResults);
        console.log(`${scenarioResults.throughput.toLocaleString()} op/s (${scenarioResults.hitRate.toFixed(3)} hit rate)`);
      }
    }

    return results;
  }

  private async runScenarioBenchmark(
    strategyName: string,
    factory: CacheFactory<number, string>,
    scenario: TestScenario,
    config: Required<BenchmarkOptions>
  ): Promise<PerformanceResult> {
    const durations: number[] = [];
    const throughputs: number[] = [];
    const hitRates: number[] = [];
    const evictions: number[] = [];
    let memoryUsage = 0;

    const totalRounds = config.warmupRounds + config.testRounds;

    for (let round = 0; round < totalRounds; round++) {
      const cache = factory(config.cacheSize);
      
      if (config.collectGC && global.gc) {
        global.gc();
      }
      
      const memBefore = config.collectGC ? PerformanceMetrics.measureMemoryUsage() : 0;
      
      const { duration } = PerformanceMetrics.measure(() => {
        scenario.execute(cache);
      });
      
      const memAfter = config.collectGC ? PerformanceMetrics.measureMemoryUsage() : 0;
      
      if (round >= config.warmupRounds) {
        durations.push(duration);
        throughputs.push(PerformanceMetrics.calculateThroughput(config.operations, duration));
        hitRates.push(cache.stats.hitRate);
        evictions.push(cache.stats.evictions);
        
        if (config.collectGC) {
          memoryUsage = Math.max(memoryUsage, memAfter - memBefore);
        }
      }
    }

    const result: PerformanceResult = {
      strategy: strategyName,
      testName: scenario.name,
      operations: config.operations,
      duration: this.average(durations),
      throughput: this.average(throughputs),
      avgLatency: this.average(durations) / config.operations,
      hitRate: this.average(hitRates),
      evictions: Math.round(this.average(evictions))
    };

    if (config.collectGC) {
      result.memoryUsage = memoryUsage;
    }

    return result;
  }

  async runSingleTest(
    strategyName: string,
    scenario: TestScenario,
    options: BenchmarkOptions = {}
  ): Promise<PerformanceResult> {
    const factory = this.cacheFactories.get(strategyName);
    if (!factory) {
      throw new Error(`Strategy '${strategyName}' not found`);
    }

    const config = { ...BenchmarkRunner.DEFAULT_OPTIONS, ...options };
    return this.runScenarioBenchmark(strategyName, factory, scenario, config);
  }

  printResults(results: PerformanceResult[]): void {
    console.log(PerformanceMetrics.formatResults(results));
    console.log(PerformanceMetrics.compareResults(results));
  }

  private average(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}