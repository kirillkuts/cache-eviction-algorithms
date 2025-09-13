import { CacheWithStats, CacheStatistics } from '../base/Cache';
import { pseudoRandomBytes } from "node:crypto";

interface ClockNode<K, V> {
  key: K;
  value: V;
  referenceBit: boolean;
  valid: boolean;
}

export class ClockCache<K, V> implements CacheWithStats<K, V> {
  private buffer: ClockNode<K, V>[];
  private keyToIndex = new Map<K, number>();
  private clockHand = 0;
  private _size = 0;
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

    this.buffer = new Array(_capacity);
    for (let i = 0; i < _capacity; i++) {
      this.buffer[i] = {
        key: null as any,
        value: null as any,
        referenceBit: false,
        valid: false
      };
    }
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this._capacity;
  }

  get stats(): CacheStatistics {
    return this._stats;
  }

  get(key: K): V | undefined {
    const index = this.keyToIndex.get(key);

    if (index === undefined) {
      this.stats.misses++;
      return undefined;
    }

    const value = this.buffer[index];

    if ( !value.valid ) {
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return value.value;
  }

  set(key: K, value: V): void {
    const existingKey = this.keyToIndex.get(key);
    if (existingKey !== undefined) {
      this.buffer[existingKey].value = value;
      this.buffer[existingKey].valid = true;
      this.buffer[existingKey].referenceBit = true;

      return;
    }

    let position;

    if ( this.size < this.capacity ) {
      position = this.findEmptySlot();
    } else {
      position = this.findVictim();
    }

    this.buffer[position] = {
      key,
      value,
      referenceBit: true,
      valid: true
    };

    this.keyToIndex.set(key, position);
    this._size++;
  }

  delete(key: K): boolean {
    const existingKey = this.keyToIndex.get(key);

    if (existingKey !== undefined) {
      this.buffer[existingKey].valid = false;
      this.buffer[existingKey].referenceBit = false;
      this.keyToIndex.delete(key);
      this._size--;
    }

    return existingKey !== undefined;
  }

  has(key: K): boolean {
    const existingKey = this.keyToIndex.get(key);

    if (existingKey !== undefined) {
      return this.buffer[existingKey].valid
    }

    return false;
  }

  clear(): void {
    this.keyToIndex.clear();
    this.buffer.forEach((value, key) => value.valid = false);
    this._size = 0;
  }

  resetStats(): void {
    this._stats.hits = 0;
    this._stats.misses = 0;
    this._stats.evictions = 0;
  }

  private findEmptySlot(): number {
    return this.buffer.findIndex(i => !i.valid);
  }

  private findVictim(): number {
    while(true) {
      const item = this.buffer[this.clockHand];

      if ( !item.referenceBit ) {
        this.delete(item.key);
        this.stats.evictions++;
        return this.clockHand;
      }

      item.referenceBit = false;

      this.clockHand++;

      if ( this.clockHand === this.capacity ) {
        this.clockHand = 0;
      }
    }

    return -1;
  }
}
