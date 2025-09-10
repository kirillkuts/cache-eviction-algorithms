export class DoublyLinkedListNode<T> {
  constructor(
    public data: T,
    public prev: DoublyLinkedListNode<T> | null = null,
    public next: DoublyLinkedListNode<T> | null = null
  ) {}
}

export class DoublyLinkedList<T> {
  private head: DoublyLinkedListNode<T> | null = null;
  private tail: DoublyLinkedListNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  addFirst(data: T): DoublyLinkedListNode<T> {
    const node = new DoublyLinkedListNode(data);
    
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    
    this._size++;
    return node;
  }

  addLast(data: T): DoublyLinkedListNode<T> {
    const node = new DoublyLinkedListNode(data);
    
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    
    this._size++;
    return node;
  }

  remove(node: DoublyLinkedListNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this._size--;
  }

  moveToFirst(node: DoublyLinkedListNode<T>): void {
    if (node === this.head) return;
    
    this.remove(node);
    node.prev = null;
    node.next = this.head;
    
    if (this.head) {
      this.head.prev = node;
    }
    
    this.head = node;
    
    if (!this.tail) {
      this.tail = node;
    }
    
    this._size++;
  }

  removeLast(): T | null {
    if (!this.tail) return null;
    
    const data = this.tail.data;
    this.remove(this.tail);
    return data;
  }

  clear(): void {
    this.head = this.tail = null;
    this._size = 0;
  }
}