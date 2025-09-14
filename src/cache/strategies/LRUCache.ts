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
    return this.list.size;
  }

  get capacity(): number {
    return this._capacity;
  }

  get stats(): CacheStatistics {
    return this._stats;
  }

  get(key: K): V | undefined {
    const node = this.keyToNode.get(key);

    if (node) {
      this.list.moveToFirst(node);
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    return node?.data?.value;
  }

  set(key: K, value: V): void {
    const node = this.keyToNode.get(key);

    // node already exists
    if ( node !== undefined ) {
        node.data.value = value;
        this.list.moveToFirst(node);

        return;
    }

    // node does not exist
    if ( this.size == this.capacity ) {
      const node = this.list.removeLast();

      if (!node) {
        return;
      }

      this.keyToNode.delete(node.key);

      this.stats.evictions++;
    }

    const newListItem: LRUNode<K, V> = {
      key: key,
      value: value,
    };

    const newNode = this.list.addFirst(newListItem);
    this.keyToNode.set(key, newNode);
  }

  delete(key: K): boolean {
    const node = this.keyToNode.get(key);

    if ( !node ) {
      return false;
    }

    this.list.remove(node);
    this.keyToNode.delete(key);

    return true;
  }

  has(key: K): boolean {
    return this.keyToNode.has(key);
  }

  clear(): void {
    this.keyToNode.clear();
    this.list.clear();
  }

  resetStats(): void {
    this._stats.hits = 0;
    this._stats.misses = 0;
    this._stats.evictions = 0;
  }
}
