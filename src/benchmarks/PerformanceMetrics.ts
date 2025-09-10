export interface PerformanceResult {
  strategy: string;
  testName: string;
  operations: number;
  duration: number;
  throughput: number;
  avgLatency: number;
  hitRate: number;
  evictions: number;
  memoryUsage?: number;
}

export interface BenchmarkOptions {
  warmupRounds?: number;
  testRounds?: number;
  operations?: number;
  cacheSize?: number;
  keyRange?: number;
  collectGC?: boolean;
}

export class PerformanceMetrics {
  static measureMemoryUsage(): number {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage().heapUsed;
  }

  static async measureAsync<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = process.hrtime.bigint();
    const result = await operation();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    return { result, duration };
  }

  static measure<T>(operation: () => T): { result: T; duration: number } {
    const start = process.hrtime.bigint();
    const result = operation();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    return { result, duration };
  }

  static calculateThroughput(operations: number, durationMs: number): number {
    return operations / (durationMs / 1000);
  }

  static formatResults(results: PerformanceResult[]): string {
    const maxStrategyLength = Math.max(...results.map(r => r.strategy.length));
    const maxTestLength = Math.max(...results.map(r => r.testName.length));
    
    let output = '\n';
    output += `${'Strategy'.padEnd(maxStrategyLength)} | `;
    output += `${'Test'.padEnd(maxTestLength)} | `;
    output += `${'Ops'.padStart(8)} | `;
    output += `${'Duration(ms)'.padStart(12)} | `;
    output += `${'Throughput(op/s)'.padStart(16)} | `;
    output += `${'Avg Latency(ms)'.padStart(15)} | `;
    output += `${'Hit Rate'.padStart(9)} | `;
    output += `${'Evictions'.padStart(10)} | `;
    output += `${'Memory(MB)'.padStart(11)}\n`;
    
    output += '-'.repeat(120) + '\n';
    
    for (const result of results) {
      output += `${result.strategy.padEnd(maxStrategyLength)} | `;
      output += `${result.testName.padEnd(maxTestLength)} | `;
      output += `${result.operations.toLocaleString().padStart(8)} | `;
      output += `${result.duration.toFixed(2).padStart(12)} | `;
      output += `${result.throughput.toLocaleString().padStart(16)} | `;
      output += `${result.avgLatency.toFixed(4).padStart(15)} | `;
      output += `${(result.hitRate * 100).toFixed(1).padStart(7)}% | `;
      output += `${result.evictions.toLocaleString().padStart(10)} | `;
      output += `${result.memoryUsage ? (result.memoryUsage / 1024 / 1024).toFixed(2) : 'N/A'}`.padStart(11);
      output += '\n';
    }
    
    return output;
  }

  static compareResults(results: PerformanceResult[]): string {
    const groupedByTest = results.reduce((acc, result) => {
      if (!acc[result.testName]) {
        acc[result.testName] = [];
      }
      acc[result.testName].push(result);
      return acc;
    }, {} as Record<string, PerformanceResult[]>);

    let output = '\n=== Performance Comparison ===\n';
    
    for (const [testName, testResults] of Object.entries(groupedByTest)) {
      output += `\n${testName}:\n`;
      
      const sortedByThroughput = [...testResults].sort((a, b) => b.throughput - a.throughput);
      const best = sortedByThroughput[0];
      
      for (const result of sortedByThroughput) {
        const ratio = result.throughput / best.throughput;
        output += `  ${result.strategy.padEnd(12)}: ${result.throughput.toLocaleString().padStart(12)} op/s`;
        if (result !== best) {
          output += ` (${(ratio * 100).toFixed(1)}% of best)`;
        } else {
          output += ` (best)`;
        }
        output += `\n`;
      }
    }
    
    return output;
  }
}