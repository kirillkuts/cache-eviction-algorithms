import { CacheWithStats, CacheStatistics } from '../base/Cache';
import { DoublyLinkedList, DoublyLinkedListNode } from '../../utils/DoublyLinkedList';

interface LRUNode<K, V> {
  key: K;
  value: V;
}

export class LRUCache<K, V> implements CacheWithStats<K, V> {
  private keyToNode = new Map<K, DoublyLinkedListNode<LRUNode<K, V>>>();
  private list = new DoublyLinkedList<LRUNode<K, V>>();
  private _stats: CacheStatistics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    get hitRate() {
      const total = this.hits + this.misses;
      return total === 0 ? 0 : this.hits / total;
    }
  };

  constructor(private readonly _capacity: number) {
    if (_capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
  }

  get size(): number {
    // TODO: Implement - return the current number of items in cache
    throw new Error('Method not implemented');
  }

  get capacity(): number {
    return this._capacity;
  }

  get stats(): CacheStatistics {
    return this._stats;
  }

  get(key: K): V | undefined {
    // TODO: Implement LRU get operation
    // 1. Check if key exists in keyToNode map
    // 2. If not found, increment misses and return undefined
    // 3. If found, increment hits, move node to front of list, return value
    throw new Error('Method not implemented');
  }

  set(key: K, value: V): void {
    // TODO: Implement LRU set operation
    // 1. Check if key already exists
    // 2. If exists, update value and move to front
    // 3. If not exists and at capacity, evict least recently used (last) item
    // 4. Add new item to front of list and update maps
    throw new Error('Method not implemented');
  }

  delete(key: K): boolean {
    // TODO: Implement delete operation
    // 1. Check if key exists
    // 2. If exists, remove from both list and map, return true
    // 3. If not exists, return false
    throw new Error('Method not implemented');
  }

  has(key: K): boolean {
    // TODO: Implement - check if key exists in cache
    throw new Error('Method not implemented');
  }

  clear(): void {
    // TODO: Implement - clear all items from cache
    throw new Error('Method not implemented');
  }

  resetStats(): void {
    this._stats.hits = 0;
    this._stats.misses = 0;
    this._stats.evictions = 0;
  }
}