---
tags:
  - leetcode
date: 2024-07-15
author: Ruslan Seit-Akaev
---
## Описание

TODO: Доделать как вернуть за приоритетной очередью

`FIFO`

---
## Особенности

## Плюсы

### Минусы

---
## Операции над `очередью`

### Создание

```typescript
const stack = new Stack();
```

### Добавление элемента на вершину стека `O(1)`

```typescript
stack.push('google');
```

### Удаление элемента из вершины стека `O(1)`

```typescript
stack.pop();
```

### Вернуть элемент, находящийся на вершине стека `O(1)`

```typescript
stack.peek();
```

### Проверить, пустой ли стек

```typescript
stack.isEmpty();
```

---
## Реализация

При реализации важно выбрать правильное направление:

- от `bottom` к `top`;
- от `top` к `bottom`.

Если выбрать от `bottom` к `top`, то `top.next` будет всегда указывать на `null`, а значит операция `pop` будет выполняться за `O(n)` (так как нужно найти узел, который ссылается на `top`, а это перебирать весь список, начиная с`bottom`).

Если же выбрать от `top` к `bottom`, то `bottom.next` всегда будет указывать на `null`, и операция `pop` будет выполнять за `O(1)`.

```typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null;

  constructor(value: T, next: ListNode<T> | null = null) {
    this.value = value;
    this.next = next;
  }
}

class Queue<T> {
  first: ListNode<T> | null;
  last: ListNode<T> | null;
  length: number;

  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  // O(1) time complexity
  enqueue(value: T): this {
    const node = new ListNode(value);

    if (this.first === null) {
      this.first = node;
    }

    if (this.last !== null) {
      this.last.next = node;
    }

    this.last = node;

    this.length += 1;

    return this;
  }

  // O(1) time complexity
  dequeue(): T | null {
    if (this.first === null) return null;

    const value = this.first.value;

    if (this.first === this.last) {
      this.last = null;
    }

    this.first = this.first.next;

    this.length -= 1;

    return value;
  }

  // O(1) time complexity
  peek(): T | null {
    return this.first?.value ?? null;
  }

  // O(1) time complexity
  isEmpty(): boolean {
    return this.first === null;
  }
}
```

---
## Техники

---
## Рецепты

---
## Задачи

```dataviewjs
const mainTopic = dv.current().file.name.toLowerCase();

const LEVELS_CODES = {
	'elementary': 0,
	'easy': 1,
	'middle': 2,
	'hard': 3,
};

dv.table(["Task", "Additional topics", "Level"], dv.pages('#leetcode')
	.sort(entity => LEVELS_CODES[entity.level])
	.filter(entity => {
		return dv
			.array(entity.topics)
			.includes(mainTopic);
	})
	.map(entity => {
		const topics = entity.topics.filter((topic) => topic !== mainTopic);

		return [entity.file.link, topics, entity.level];
	}));
```
