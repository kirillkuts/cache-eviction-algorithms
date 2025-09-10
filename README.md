# Cache Eviction Strategies

A TypeScript implementation and performance testing framework for various cache eviction strategies including LRU, Clock, and LRU-K algorithms.

## Features

- **Multiple Cache Strategies**:
  - LRU (Least Recently Used)
  - Clock (Second Chance)
  - LRU-K (Least Recently Used with K references)

- **Comprehensive Performance Testing**:
  - Multiple test scenarios (sequential, random, working set, Zipfian, etc.)
  - Detailed performance metrics (throughput, latency, hit rate, memory usage)
  - Statistical analysis and comparison tools

- **Type Safe**: Full TypeScript implementation with strict type checking

## Quick Start

### Installation

```bash
npm install
```

### Build the project

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Run benchmarks

```bash
npm run benchmark
```

## Usage

### Basic Cache Usage

```typescript
import { LRUCache, ClockCache, LRUKCache } from './src/cache';

// Create an LRU cache with capacity of 1000
const lruCache = new LRUCache<string, number>(1000);

// Basic operations
lruCache.set('key1', 42);
const value = lruCache.get('key1'); // 42
const hasKey = lruCache.has('key1'); // true
lruCache.delete('key1');

// Access statistics
console.log(lruCache.stats.hitRate);
console.log(lruCache.stats.evictions);
```

### Running Custom Benchmarks

```typescript
import { BenchmarkRunner, TestScenarios } from './src/benchmarks';

const runner = new BenchmarkRunner();

// Run a single test
const result = await runner.runSingleTest(
  'LRU',
  TestScenarios.random(50000, 25000),
  {
    cacheSize: 1000,
    warmupRounds: 3,
    testRounds: 5
  }
);

console.log(`Throughput: ${result.throughput} ops/sec`);
console.log(`Hit Rate: ${result.hitRate}`);
```

### Adding Custom Cache Strategies

```typescript
import { Cache, CacheWithStats } from './src/cache/base/Cache';

class CustomCache<K, V> implements CacheWithStats<K, V> {
  // Implement required methods...
}

const runner = new BenchmarkRunner();
runner.addCacheStrategy('Custom', (capacity) => new CustomCache(capacity));

// Now you can benchmark your custom strategy
const results = await runner.runBenchmark(['Custom', 'LRU']);
```

## Cache Strategies

### LRU (Least Recently Used)
- Evicts the least recently accessed item
- O(1) for all operations
- Uses doubly-linked list + hashmap implementation

### Clock (Second Chance)
- Approximates LRU using reference bits
- More memory efficient than LRU
- Good performance with lower overhead

### LRU-K
- Tracks the K most recent accesses for each item
- Better handling of scan-resistant workloads
- Configurable K parameter (default K=2)

## Test Scenarios

The framework includes several built-in test scenarios:

- **Sequential Access**: Linear access patterns
- **Random Access**: Uniform random key distribution  
- **Working Set**: 80/20 access pattern with locality
- **Zipfian Distribution**: Realistic web/database workloads
- **Temporal Locality**: Time-based access patterns
- **Sequential Scan**: Cache-unfriendly scan patterns
- **Mixed Workload**: Combination of different patterns

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run development server with auto-reload
- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run benchmark` - Run performance benchmarks
- `npm run clean` - Remove compiled files

## Project Structure

```
src/
├── cache/
│   ├── base/           # Interface definitions
│   ├── strategies/     # Cache implementations
│   └── index.ts
├── benchmarks/         # Performance testing framework
├── utils/              # Helper utilities
└── index.ts
tests/                  # Unit tests
└── cache/strategies/   # Strategy-specific tests
```

## Performance Results

Run `npm run benchmark` to see performance comparisons across different strategies and workloads. Example output:

```
Strategy | Test              | Throughput(op/s) | Hit Rate | Evictions
LRU      | Sequential Access | 2,150,000        | 92.5%    | 45,231
Clock    | Sequential Access | 2,890,000        | 91.8%    | 46,102
LRU-2    | Sequential Access | 1,980,000        | 93.1%    | 44,892
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC