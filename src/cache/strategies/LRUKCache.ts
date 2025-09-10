import { CacheWithStats, CacheStatistics } from '../base/Cache';

interface LRUKNode<K, V> {
  key: K;
  value: V;
  accessTimes: number[];
}

export class LRUKCache<K, V> implements CacheWithStats<K, V> {
  private cache = new Map<K, LRUKNode<K, V>>();
  private _stats: CacheStatistics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    get hitRate() {
      const total = this.hits + this.misses;
      return total === 0 ? 0 : this.hits / total;
    }
  };

  constructor(
    private readonly _capacity: number,
    private readonly k: number = 2
  ) {
    if (_capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    if (k <= 0) {
      throw new Error('K must be positive');
    }
  }

  get size(): number {
    return this.cache.size;
  }

  get capacity(): number {
    return this._capacity;
  }

  get stats(): CacheStatistics {
    return this._stats;
  }

  get(key: K): V | undefined {
    // TODO: Implement LRU-K get operation
    // 1. Look up key in cache map
    // 2. If not found, increment misses and return undefined
    // 3. If found, increment hits, update access time, return value
    throw new Error('Method not implemented');
  }

  set(key: K, value: V): void {
    // TODO: Implement LRU-K set operation
    // 1. Check if key already exists and update if so
    // 2. If cache at capacity, find victim using LRU-K algorithm
    // 3. Create new node with current timestamp in accessTimes array
    // 4. Add to cache map
    throw new Error('Method not implemented');
  }

  delete(key: K): boolean {
    // TODO: Implement delete operation
    return this.cache.delete(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  resetStats(): void {
    this._stats.hits = 0;
    this._stats.misses = 0;
    this._stats.evictions = 0;
  }

  private updateAccessTime(node: LRUKNode<K, V>): void {
    // TODO: Implement access time tracking
    // 1. Add current timestamp to accessTimes array
    // 2. If array exceeds K elements, remove oldest (shift)
    // This maintains the K most recent access times
    throw new Error('Method not implemented');
  }

  private findVictim(): K | null {
    // TODO: Implement LRU-K victim selection algorithm
    // 1. Scan all nodes in cache
    // 2. For nodes with < K accesses, compare first access time (oldest wins)
    // 3. For nodes with K accesses, compare Kth access time (oldest wins)
    // 4. Prefer evicting nodes with fewer accesses over those with K accesses
    // 5. Return key of victim node
    throw new Error('Method not implemented');
  }
}