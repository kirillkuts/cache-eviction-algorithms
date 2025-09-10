export interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  delete(key: K): boolean;
  clear(): void;
  has(key: K): boolean;
  readonly size: number;
  readonly capacity: number;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  evictions: number;
  readonly hitRate: number;
}

export interface CacheWithStats<K, V> extends Cache<K, V> {
  readonly stats: CacheStatistics;
  resetStats(): void;
}