import { LRUCache } from "../LRUCache";

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3);
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

  describe('LRU Behavior', () => {
    test('should evict least recently used item when capacity exceeded', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
      expect(cache.size).toBe(3);
    });

    test('should update LRU order on get', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('a'); // Make 'a' most recently used
      cache.set('d', 4); // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    test('should update LRU order on set for existing key', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.set('a', 10); // Update 'a' and make it most recently used
      cache.set('d', 4); // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
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
      expect(() => new LRUCache(0)).toThrow('Capacity must be positive');
      expect(() => new LRUCache(-1)).toThrow('Capacity must be positive');
    });

    test('should work with capacity of 1', () => {
      const smallCache = new LRUCache<string, number>(1);

      smallCache.set('a', 1);
      expect(smallCache.get('a')).toBe(1);

      smallCache.set('b', 2); // Should evict 'a'
      expect(smallCache.get('a')).toBeUndefined();
      expect(smallCache.get('b')).toBe(2);
    });
  });
});
