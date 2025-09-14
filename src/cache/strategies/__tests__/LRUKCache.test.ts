import { LRUKCache } from "../LRUKCache";

describe('LRUKCache', () => {
  let cache: LRUKCache<string, number>;

  beforeEach(() => {
    cache = new LRUKCache<string, number>(3, 2); // LRU-2 cache
  });

  describe('Basic Operations', () => {
    test('should set and get values', () => {
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    test('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should update existing values', () => {
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.get('a')).toBe(2);
      expect(cache.size).toBe(1);
    });

    test('should delete values', () => {
      cache.set('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.size).toBe(0);
    });

    test('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    test('should check if key exists', () => {
      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    test('should clear all values', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
    });
  });

  describe('LRU-K Behavior', () => {
    test('should evict items when capacity is exceeded', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should evict one item

      expect(cache.size).toBe(3);
      // One item should have been evicted
      const items = ['a', 'b', 'c', 'd'];
      const presentItems = items.filter(key => cache.has(key));
      expect(presentItems.length).toBe(3);
    });

    test('should prefer evicting items with fewer than K accesses', () => {
      cache.set('a', 1);
      cache.get('a'); // 'a' now has 2 accesses (set + get)

      cache.set('b', 2); // 'b' has 1 access
      cache.set('c', 3); // 'c' has 1 access
      cache.set('d', 4); // Should evict 'b' or 'c', not 'a'

      expect(cache.get('a')).toBe(1); // 'a' should still be present
      expect(cache.size).toBe(3);
    });

    test('should track access times correctly', () => {
      cache.set('a', 1);

      // Access 'a' multiple times
      cache.get('a');
      cache.get('a');

      // Fill cache
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should not evict 'a'

      expect(cache.get('a')).toBe(1); // 'a' should still be there
    });
  });

  describe('LRU-K with different K values', () => {
    test('should work with K=1 (equivalent to LRU)', () => {
      const lru1Cache = new LRUKCache<string, number>(2, 1);

      lru1Cache.set('a', 1);
      lru1Cache.set('b', 2);
      lru1Cache.set('c', 3); // Should evict 'a'

      expect(lru1Cache.get('a')).toBeUndefined();
      expect(lru1Cache.get('b')).toBe(2);
      expect(lru1Cache.get('c')).toBe(3);
    });

    test('should work with K=3', () => {
      const lru3Cache = new LRUKCache<string, number>(2, 3);

      lru3Cache.set('a', 1);
      lru3Cache.get('a');
      lru3Cache.get('a'); // 'a' now has 3 accesses

      lru3Cache.set('b', 2); // 'b' has 1 access
      lru3Cache.set('c', 3); // Should evict 'b', not 'a'

      expect(lru3Cache.get('a')).toBe(1);
      expect(lru3Cache.get('b')).toBeUndefined();
      expect(lru3Cache.get('c')).toBe(3);
    });
  });

  describe('Statistics', () => {
    test('should track hits and misses', () => {
      cache.set('a', 1);
      cache.get('a'); // hit
      cache.get('b'); // miss

      expect(cache.stats.hits).toBe(1);
      expect(cache.stats.misses).toBe(1);
      expect(cache.stats.hitRate).toBe(0.5);
    });

    test('should track evictions', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should cause eviction

      expect(cache.stats.evictions).toBe(1);
    });

    test('should reset statistics', () => {
      cache.set('a', 1);
      cache.get('a');
      cache.get('b');
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // eviction

      cache.resetStats();

      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
      expect(cache.stats.evictions).toBe(0);
      expect(cache.stats.hitRate).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error for invalid capacity', () => {
      expect(() => new LRUKCache(0)).toThrow('Capacity must be positive');
      expect(() => new LRUKCache(-1)).toThrow('Capacity must be positive');
    });

    test('should throw error for invalid K', () => {
      expect(() => new LRUKCache(10, 0)).toThrow('K must be positive');
      expect(() => new LRUKCache(10, -1)).toThrow('K must be positive');
    });

    test('should work with capacity of 1', () => {
      const smallCache = new LRUKCache<string, number>(1, 2);

      smallCache.set('a', 1);
      expect(smallCache.get('a')).toBe(1);

      smallCache.set('b', 2); // Should evict 'a'
      expect(smallCache.get('a')).toBeUndefined();
      expect(smallCache.get('b')).toBe(2);
    });
  });
});
