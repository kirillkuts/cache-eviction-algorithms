import { CacheWithStats, CacheStatistics } from '../base/Cache';
import { IndexedMinHeap } from "../../utils/heap/heap";

interface LRUKNode<K, V> {
  key: K;
  value: V;
  accessTimes: number[];
}

export class LRUKCache<K, V> implements CacheWithStats<K, V> {
  private cache = new Map<K, LRUKNode<K, V>>();
  private heap: IndexedMinHeap;
  private counter = 0;
  private keysToId = new Map<K, number>();
  private idToKeys = new Map<number, K>();
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

    this.heap = new IndexedMinHeap(k);
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
    this.counter++;

    const node = this.cache.get(key);

    if ( node === undefined ) {
      this.stats.misses++;
    } else {
      this.stats.hits++;
      this.updateAccessTime(node);
    }

    return node?.value;
  }

  set(key: K, value: V): void {
    this.counter++;

    const node = this.cache.get(key);

    // key already exist
    if ( node !== undefined ) {
      this.updateAccessTime(node);
      node.value = value;
      return;
    }

    // need evict
    if ( this.size === this.capacity ) {
      this.evict();
    }

    const newNode: LRUKNode<K, V> = {
      key,
      value,
      accessTimes: [this.counter],
    }

    this.idToKeys.set(this.counter, newNode.key);
    this.keysToId.set(newNode.key, this.counter);

    this.heap.insert(this.counter, Number.MIN_SAFE_INTEGER);

    this.cache.set(key, newNode);

  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.heap = new IndexedMinHeap(this.capacity);
  }

  resetStats(): void {
    this._stats.hits = 0;
    this._stats.misses = 0;
    this._stats.evictions = 0;
  }

  private updateAccessTime(node: LRUKNode<K, V>): void {
    node.accessTimes.unshift(this.counter);

    if ( node.accessTimes.length > this.k ) {
      node.accessTimes.pop();
    }

    const id = this.keysToId.get(node.key);

    if ( id !== undefined ) {
      const kValue = node.accessTimes.length === this.k ? node.accessTimes.at(-1)! : Number.MIN_SAFE_INTEGER;
      this.heap.increaseKey(id, kValue);
    }
  }

  private evict(): K | null {
    const idToEvict = this.heap.pop();
    const keyToEvict = this.idToKeys.get(idToEvict);

    if ( keyToEvict == undefined ) {
      return null;
    }

    this.cache.delete(keyToEvict);
    this.idToKeys.delete(idToEvict);
    this.keysToId.delete(keyToEvict);

    this.stats.evictions++;

    return keyToEvict;
  }
}
