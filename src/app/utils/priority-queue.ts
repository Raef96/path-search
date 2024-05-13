interface IPriorityQueue<TElement, TPriority> {
  enqueue(element: TElement, priority: TPriority): void
  dequeue(): TElement | null
  peek(): TElement | null
  count(): number
  isEmpty(): boolean
}

interface IPriorityQueueWithTieBreak<TElement, TPriority, TTieBreak> extends IPriorityQueue<TElement, TPriority> {
  enqueueWithTieBreak(element: TElement, priority: TPriority, tieBreak: TTieBreak): void
}

interface KeyValuePair<TElement, TPriority> {
  index: number,
  value: [TPriority, TElement]
}

export class priorityQueue<TElement, TPriority> implements IPriorityQueue<TElement, TPriority> {
  protected data: [TPriority, TElement][] = [];

  constructor() {
  }

  enqueue(element: TElement, priority: TPriority): void {
    this.data.push([priority, element]);
  }

  dequeue = (): TElement | null => {
    if (this.data.length === 0)
      return null;

    let lowestElements = this.findElementsWithLowestPriority();
    // peek the first element index
    let { index, value } = lowestElements[0];

    this.data.splice(index, 1);
    return value[1];
  }

  protected findElementsWithLowestPriority = () => {
    let res: KeyValuePair<TElement, TPriority>[] = [{ index: 0, value: this.data[0] }];
    let minPriority = this.data[0][0];

    this.data.forEach((value, index) => {
      let priority = value[0];
      if (value[0] < minPriority) {
        minPriority = priority;
        res = [{ index: index, value: value }];
      }
      else if (priority === minPriority) {
        res.push({ index: index, value: value });
      }
    });

    return res;
  }

  peek = (): TElement | null => {
    return this.data.length === 0
      ? null
      : this.data.reduce((prev, curr) => curr[0] < prev[0] ? curr : prev)[1];
  }

  count = (): number => this.data.length;
  isEmpty = (): boolean => this.data.length == 0
}

export class PriorityQueueWithTieBreak<TElement, TPriority, TTieBreak> extends priorityQueue<TElement, TPriority>
  implements IPriorityQueueWithTieBreak<TElement, TPriority, TTieBreak> {

  private tieBreaks: TTieBreak[] = [];

  constructor() {
    super();
  }

  enqueueWithTieBreak = (element: TElement, priority: TPriority, tieBreak: TTieBreak) => {
    this.enqueue(element, priority);
    this.tieBreaks.push(tieBreak);
  }

  override dequeue = (): TElement | null => {
    if (this.data.length === 0)
      return null;

    let lowestElements = this.findElementsWithLowestPriority();
    let minTieBreak: TTieBreak = this.tieBreaks[lowestElements[0].index];
    let minElement: TElement = lowestElements[0].value[1];
    let minElementIdx: number = lowestElements[0].index ;
    lowestElements.forEach(kv => {
      if (this.tieBreaks[kv.index] < minTieBreak) {
        minElementIdx = kv.index;
        minTieBreak = this.tieBreaks[kv.index];
        minElement = kv.value[1];
      }
    });
    this.data.splice(minElementIdx, 1);
    this.tieBreaks.splice(minElementIdx, 1);
    return minElement;
  }
}
