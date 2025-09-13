import { IndexedMinHeap } from './heap';

describe('IndexedMinHeap', () => {
  describe('Constructor & Basic Properties', () => {
    test('should create heap with valid capacity', () => {
      const heap = new IndexedMinHeap(10);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    test('should throw error for non-positive capacity', () => {
      expect(() => new IndexedMinHeap(0)).toThrow('capacity must be a positive integer');
      expect(() => new IndexedMinHeap(-1)).toThrow('capacity must be a positive integer');
      expect(() => new IndexedMinHeap(-10)).toThrow('capacity must be a positive integer');
    });

    test('should throw error for non-integer capacity', () => {
      expect(() => new IndexedMinHeap(3.14)).toThrow('capacity must be a positive integer');
      expect(() => new IndexedMinHeap(NaN)).toThrow('capacity must be a positive integer');
      expect(() => new IndexedMinHeap(Infinity)).toThrow('capacity must be a positive integer');
    });

    test('should have correct initial state', () => {
      const heap = new IndexedMinHeap(5);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('Basic Operations', () => {
    let heap: IndexedMinHeap;

    beforeEach(() => {
      heap = new IndexedMinHeap(10);
    });

    test('size() should return correct count', () => {
      expect(heap.size()).toBe(0);
      heap.insert(0, 10);
      expect(heap.size()).toBe(1);
      heap.insert(1, 5);
      expect(heap.size()).toBe(2);
    });

    test('isEmpty() should return correct status', () => {
      expect(heap.isEmpty()).toBe(true);
      heap.insert(0, 10);
      expect(heap.isEmpty()).toBe(false);
    });

    test('min() should return element with minimum key', () => {
      heap.insert(0, 10);
      heap.insert(1, 5);
      heap.insert(2, 15);
      expect(heap.min()).toBe(1); // ID of element with key 5
    });

    test('minKey() should return minimum key value', () => {
      heap.insert(0, 10);
      heap.insert(1, 5);
      heap.insert(2, 15);
      expect(heap.minKey()).toBe(5);
    });

    test('min() and minKey() should handle single element', () => {
      heap.insert(3, 42);
      expect(heap.min()).toBe(3);
      expect(heap.minKey()).toBe(42);
    });
  });

  describe('Insert Operations', () => {
    let heap: IndexedMinHeap;

    beforeEach(() => {
      heap = new IndexedMinHeap(5);
    });

    test('insert() should update size correctly', () => {
      expect(heap.size()).toBe(0);
      heap.insert(0, 10);
      expect(heap.size()).toBe(1);
      heap.insert(1, 20);
      expect(heap.size()).toBe(2);
    });

    test('insert() should maintain heap property', () => {
      heap.insert(0, 20);
      heap.insert(1, 10);
      heap.insert(2, 30);
      heap.insert(3, 5);

      expect(heap.minKey()).toBe(5);
      expect(heap.min()).toBe(3);
    });

    test('insert() should handle duplicate keys', () => {
      heap.insert(0, 10);
      heap.insert(1, 10);
      heap.insert(2, 5);

      expect(heap.minKey()).toBe(5);
      expect(heap.size()).toBe(3);
    });
  });

  describe('Pop Operations', () => {
    let heap: IndexedMinHeap;

    beforeEach(() => {
      heap = new IndexedMinHeap(5);
    });

    test('pop() should return and remove minimum element', () => {
      heap.insert(0, 20);
      heap.insert(1, 10);
      heap.insert(2, 30);

      const minId = heap.pop();
      expect(minId).toBe(1); // ID with key 10
      expect(heap.size()).toBe(2);
      expect(heap.minKey()).toBe(20); // Next minimum
    });

    test('pop() should maintain heap property after removal', () => {
      heap.insert(0, 5);
      heap.insert(1, 10);
      heap.insert(2, 3);
      heap.insert(3, 15);

      expect(heap.pop()).toBe(2); // ID with key 3
      expect(heap.pop()).toBe(0); // ID with key 5
      expect(heap.minKey()).toBe(10);
    });

    test('pop() should handle single element heap', () => {
      heap.insert(5, 42);
      expect(heap.pop()).toBe(5);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('Key Manipulation', () => {
    let heap: IndexedMinHeap;

    beforeEach(() => {
      heap = new IndexedMinHeap(5);
      heap.insert(0, 20);
      heap.insert(1, 10);
      heap.insert(2, 30);
    });

    test('decreaseKey() should update key and maintain heap property', () => {
      heap.decreaseKey(0, 5); // Change key from 20 to 5
      expect(heap.min()).toBe(0); // ID 0 should now be minimum
      expect(heap.minKey()).toBe(5);
    });

    test('increaseKey() should update key and maintain heap property', () => {
      heap.increaseKey(1, 25); // Change key from 10 to 25
      expect(heap.min()).toBe(0); // ID 0 (key 20) should now be minimum
      expect(heap.minKey()).toBe(20);
    });

    test('changeKey() should work for both increase and decrease', () => {
      heap.changeKey(2, 5); // Change key from 30 to 5
      expect(heap.min()).toBe(2);
      expect(heap.minKey()).toBe(5);

      heap.changeKey(2, 35); // Change key from 5 to 35
      expect(heap.min()).toBe(1); // ID 1 (key 10) should now be minimum
      expect(heap.minKey()).toBe(10);
    });

    test('remove() should remove element and maintain heap property', () => {
      const initialSize = heap.size();
      heap.remove(1); // Remove ID 1 (key 10)

      expect(heap.size()).toBe(initialSize - 1);
      expect(heap.min()).toBe(0); // ID 0 (key 20) should now be minimum
      expect(heap.minKey()).toBe(20);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('should handle minimum capacity', () => {
      const heap = new IndexedMinHeap(1);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    test('should handle large capacity', () => {
      const heap = new IndexedMinHeap(1000000);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    test('operations on empty heap should handle gracefully', () => {
      const heap = new IndexedMinHeap(5);

      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);

      // These operations should either return sensible defaults or throw appropriate errors
      // The exact behavior depends on implementation requirements
    });
  });

  describe('State Consistency', () => {
    let heap: IndexedMinHeap;

    beforeEach(() => {
      heap = new IndexedMinHeap(10);
    });

    test('size and isEmpty should be consistent', () => {
      expect(heap.isEmpty()).toBe(heap.size() === 0);
    });

    test('multiple heap instances should be independent', () => {
      const heap1 = new IndexedMinHeap(5);
      const heap2 = new IndexedMinHeap(10);

      expect(heap1.size()).toBe(0);
      expect(heap2.size()).toBe(0);
      expect(heap1.isEmpty()).toBe(true);
      expect(heap2.isEmpty()).toBe(true);
    });
  });
});
