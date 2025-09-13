export class IndexedMinHeap {
    private readonly capacity: number;
    private n: number;
    private heap: number[];
    private pos: number[];
    private key: number[];

    constructor(capacity: number) {
        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new Error("capacity must be a positive integer");
        }
        this.capacity = capacity;
        this.n = 0;
        this.heap = new Array<number>(capacity);
        this.pos = Array<number>(capacity).fill(-1);
        this.key = new Array<number>(capacity);
    }

    size(): number {
        return this.n;
    }

    isEmpty(): boolean {
        return this.n === 0;
    }


    min(): number {
        return this.heap[0];
    }

    minKey(): number {
        return this.key[this.heap[0]];
    }

    insert(id: number, k: number): void {
        // heap[pos] → gives you the id stored at heap position pos.
        // pos[id] → tells you at which position in heap this id currently lives.
        // key[id] → tells you what its priority is.
        this.heap[this.n] = id;
        this.key[id] = k;

        this.pos[id] = this.n;

        this.bubbleUp(this.n);

        this.n++
    }

    pop(): number {
        const top = this.heap[0];
        const last = this.heap[this.n - 1];

        this.heap[0] = last;
        this.pos[last] = 0;
        this.pos[top] = -1; // removed
        this.n--;

        this.bubbleDown(0);
        return top;
    }

    decreaseKey(id: number, newValue: number): void {
        this.key[id] = newValue;

        const pos = this.pos[id];
        this.bubbleUp(pos);
    }

    increaseKey(id: number, newValue: number): void {
        this.key[id] = newValue;

        const pos = this.pos[id];
        this.bubbleDown(pos);
    }

    changeKey(id: number, newValue: number): void {
        const oldValue = this.key[id];
        this.key[id] = newValue;

        const pos = this.pos[id];
        if ( oldValue > newValue ) {
            this.bubbleUp(pos)
        } else {
            this.bubbleDown(pos);
        }
    }

    remove(id: number): void {
        const pos = this.pos[id];
        const last = this.heap[this.n - 1];

        this.heap[pos] = last;
        this.pos[last] = pos;
        this.pos[id] = -1; // removed
        this.n--;

        this.bubbleDown(pos);
        this.bubbleUp(pos);
    }

    // -------- internal helpers --------
    private less(i: number, j: number): boolean {
        return this.key[this.heap[i]] < this.key[this.heap[j]];
    }
    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;

        this.pos[this.heap[i]] = i;
        this.pos[this.heap[j]] = j;
    }

    private bubbleUp(i: number): void {
        while ( this.less(i, this.parent(i)) ) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private bubbleDown(i: number): void {
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;

            if (left < this.n && this.less(left, smallest)) {
                smallest = left;
            }
            if (right < this.n && this.less(right, smallest)) {
                smallest = right;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }
}
