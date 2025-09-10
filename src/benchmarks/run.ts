#!/usr/bin/env ts-node

import { BenchmarkRunner } from './BenchmarkRunner';

async function main() {
  const runner = new BenchmarkRunner();
  
  console.log('🚀 Cache Eviction Strategies Performance Benchmark');
  console.log('================================================');
  
  try {
    const results = await runner.runBenchmark(
      undefined,
      undefined,
      {
        warmupRounds: 2,
        testRounds: 3,
        operations: 50000,
        cacheSize: 1000,
        keyRange: 25000,
        collectGC: true
      }
    );
    
    runner.printResults(results);
    
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}