import { CacheWithStats } from '../cache/base/Cache';

export interface TestScenario {
  name: string;
  execute: (cache: CacheWithStats<number, string>) => Promise<void> | void;
}

export class TestScenarios {
  static sequential(operations: number): TestScenario {
    return {
      name: 'Sequential Access',
      execute: (cache) => {
        for (let i = 0; i < operations; i++) {
          if (i < cache.capacity) {
            cache.set(i, `value-${i}`);
          } else {
            cache.get(i % cache.capacity);
          }
        }
      }
    };
  }

  static random(operations: number, keyRange: number): TestScenario {
    return {
      name: 'Random Access',
      execute: (cache) => {
        for (let i = 0; i < operations; i++) {
          const key = Math.floor(Math.random() * keyRange);
          if (Math.random() < 0.7) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  static workingSet(operations: number, workingSetSize: number, totalKeys: number): TestScenario {
    return {
      name: 'Working Set (80/20)',
      execute: (cache) => {
        for (let i = 0; i < operations; i++) {
          let key: number;
          
          if (Math.random() < 0.8) {
            key = Math.floor(Math.random() * workingSetSize);
          } else {
            key = workingSetSize + Math.floor(Math.random() * (totalKeys - workingSetSize));
          }

          if (Math.random() < 0.7) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  static zipfian(operations: number, keyRange: number, alpha: number = 1.0): TestScenario {
    return {
      name: 'Zipfian Distribution',
      execute: (cache) => {
        const zipfKeys = TestScenarios.generateZipfKeys(keyRange, alpha);
        
        for (let i = 0; i < operations; i++) {
          const key = zipfKeys[Math.floor(Math.random() * zipfKeys.length)];
          
          if (Math.random() < 0.7) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  static temporal(operations: number, keyRange: number): TestScenario {
    return {
      name: 'Temporal Locality',
      execute: (cache) => {
        let currentPhase = 0;
        const phaseSize = operations / 5;
        
        for (let i = 0; i < operations; i++) {
          if (i > 0 && i % phaseSize === 0) {
            currentPhase++;
          }
          
          const phaseStart = currentPhase * (keyRange / 5);
          const key = phaseStart + Math.floor(Math.random() * (keyRange / 5));
          
          if (Math.random() < 0.7) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  static scan(operations: number, keyRange: number): TestScenario {
    return {
      name: 'Sequential Scan',
      execute: (cache) => {
        for (let i = 0; i < operations; i++) {
          const key = i % keyRange;
          
          if (Math.random() < 0.9) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  static mixed(operations: number, keyRange: number): TestScenario {
    return {
      name: 'Mixed Workload',
      execute: (cache) => {
        const quarter = operations / 4;
        
        for (let i = 0; i < operations; i++) {
          let key: number;
          
          if (i < quarter) {
            key = Math.floor(Math.random() * (keyRange / 4));
          } else if (i < quarter * 2) {
            key = i % keyRange;
          } else if (i < quarter * 3) {
            key = Math.floor(Math.random() * keyRange);
          } else {
            key = Math.floor(Math.random() * (keyRange / 10));
          }
          
          if (Math.random() < 0.6) {
            cache.get(key);
          } else {
            cache.set(key, `value-${key}`);
          }
        }
      }
    };
  }

  private static generateZipfKeys(keyRange: number, alpha: number): number[] {
    const keys: number[] = [];
    const harmonicSum = Array.from({ length: keyRange }, (_, i) => 1 / Math.pow(i + 1, alpha))
      .reduce((sum, val) => sum + val, 0);
    
    for (let rank = 1; rank <= keyRange; rank++) {
      const probability = (1 / Math.pow(rank, alpha)) / harmonicSum;
      const count = Math.floor(probability * 10000);
      
      for (let j = 0; j < count; j++) {
        keys.push(rank - 1);
      }
    }
    
    return keys;
  }

  static getAllScenarios(operations: number = 100000, keyRange: number = 50000): TestScenario[] {
    return [
      TestScenarios.sequential(operations),
      TestScenarios.random(operations, keyRange),
      TestScenarios.workingSet(operations, Math.floor(keyRange * 0.2), keyRange),
      TestScenarios.zipfian(operations, keyRange),
      TestScenarios.temporal(operations, keyRange),
      TestScenarios.scan(operations, keyRange),
      TestScenarios.mixed(operations, keyRange)
    ];
  }
}