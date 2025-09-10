export interface CacheEntry<V> {
  value: V;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface LRUKCacheEntry<V> extends CacheEntry<V> {
  accessHistory: number[];
}

export interface ClockCacheEntry<V> extends CacheEntry<V> {
  referenceBit: boolean;
}

export function createCacheEntry<V>(value: V): CacheEntry<V> {
  const now = Date.now();
  return {
    value,
    timestamp: now,
    accessCount: 1,
    lastAccessed: now,
  };
}

export function createLRUKCacheEntry<V>(value: V, _k: number): LRUKCacheEntry<V> {
  const now = Date.now();
  return {
    value,
    timestamp: now,
    accessCount: 1,
    lastAccessed: now,
    accessHistory: [now],
  };
}

export function createClockCacheEntry<V>(value: V): ClockCacheEntry<V> {
  const now = Date.now();
  return {
    value,
    timestamp: now,
    accessCount: 1,
    lastAccessed: now,
    referenceBit: true,
  };
}