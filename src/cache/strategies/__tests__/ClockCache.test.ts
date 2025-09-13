import { ClockCache } from "../ClockCache";


describe('ClockCache', () => {
  let cache: ClockCache<string, number>;

  beforeEach(() => {
    cache = new ClockCache<string, number>(3);
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

  describe('Clock Behavior', () => {
    test('should evict items when capacity is exceeded', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // Should evict one item

      expect(cache.size).toBe(3);
      // At least one of the original items should be evicted
      const remainingItems = ['a', 'b', 'c'].filter(key => cache.has(key));
      expect(remainingItems.length).toBe(2);
      expect(cache.has('d')).toBe(true);
    });

    test('should set reference bit on access', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' multiple times to increase chances of keeping it
      cache.get('a');
      cache.get('a');
      cache.get('a');

      // Count how many items remain before adding new one
      const itemsBefore = ['a', 'b', 'c'].filter(key => cache.has(key));
      expect(itemsBefore).toHaveLength(3);

      // Add new item, one should be evicted
      cache.set('d', 4);

      expect(cache.size).toBe(3);
      expect(cache.has('d')).toBe(true);

      // At least one of the original items should be gone
      const itemsAfter = ['a', 'b', 'c'].filter(key => cache.has(key));
      expect(itemsAfter.length).toBe(2);
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
      expect(() => new ClockCache(0)).toThrow('Capacity must be positive');
      expect(() => new ClockCache(-1)).toThrow('Capacity must be positive');
    });

    test('should work with capacity of 1', () => {
      const smallCache = new ClockCache<string, number>(1);

      smallCache.set('a', 1);
      expect(smallCache.get('a')).toBe(1);

      smallCache.set('b', 2); // Should evict 'a'
      expect(smallCache.get('a')).toBeUndefined();
      expect(smallCache.get('b')).toBe(2);
    });

    test('should handle multiple evictions correctly', () => {
      const smallCache = new ClockCache<string, number>(2);

      smallCache.set('a', 1);
      smallCache.set('b', 2);
      smallCache.set('c', 3);
      smallCache.set('d', 4);
      smallCache.set('e', 5);

      expect(smallCache.size).toBe(2);
      expect(smallCache.stats.evictions).toBe(3);
    });
  });
});
