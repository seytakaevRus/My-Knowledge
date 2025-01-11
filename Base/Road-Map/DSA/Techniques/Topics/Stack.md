---
tags:
  - leetcode
date: 2024-07-11
author: Ruslan Seit-Akaev
---
## Описание

`Стек` - линейная структура данных, которая следует определенному порядку выполнения операций. В `стеке` этот порядок называется `LIFO (Last In First Out)` - элемент, который зайдёт последним, выйдет первым.

![[DSA_Stack_1.png]]

Как пример `стека` можно рассмотреть стопку тарелок, где тарелка добавляется наверх, а последняя добавленная наверх, будет первой на удаление.

В `JS` массивы могут использоваться в качестве `стека`, если не использовать доступ к элементу по индексу, и использовать только методы, присущие `стеку`.
### Где используется

- Рекурсия - стек используют для хранения локальных переменных и адресов возврата рекурсивных вызовов функций, что позволяет программе отслеживать текущее состояние рекурсии;
- Операции отменить/вернуть;
- История браузера;
- Стек вызовов функции - стек используют для отслеживания обратных адресов вызовов функций, позволяя программе вернуться в правильное место после завершения выполнения функции;
- Парсинг синтаксиса - стек используют, чтобы проверить корректность синтаксиса в языке программирования;

---
## Особенности

## Плюсы

- Операция `push` и `pop` выполняются за константное время `O(1)`;
- Принцип `LIFO`, который реализует `стек`, полезен во множестве случаев, к примеру, вызов функций и парсинг синтаксиса;
### Минусы

- Доступ есть только к элементу, который находится на вершине `стека`, делая сложным получить элемент в середине `стека`;

---
## Операции над `стеком`

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

### Проверить, пустой ли стек `O(1)`

```typescript
stack.isEmpty();
```

### Получение длины `O(1)`

```typescript
stack.length;
```

---
## Реализация

### Через связный список

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

class Stack<T> {
  top: ListNode<T> | null;
  bottom: ListNode<T> | null;
  length: number;

  constructor() {
    this.top = null;
    this.bottom = null;
    this.length = 0;
  }

  // O(1) time complexity
  push(value: T): this {
    const node = new ListNode<T>(value);

    if (this.bottom === null) {
      this.bottom = node;
    }

    if (this.top !== null) {
      const previousTop = this.top;

      node.next = previousTop;
    }

    this.top = node;

    this.length += 1;

    return this;
  }

  // O(1) time complexity
  pop(): T | null {
    if (this.top === null) return null;

    const value = this.top.value;

    if (this.top === this.bottom) {
      this.bottom = null;
    }

    this.top = this.top.next;

    this.length -= 1;

    return value;
  }

  // O(1) time complexity
  peek(): T | null {
    return this.top?.value ?? null;
  }

  // O(1) time complexity
  isEmpty(): boolean {
    return this.top === null;
  }
}
```

### Через массив

TODO: написать про разницу в кэшировании https://www.geeksforgeeks.org/why-arrays-have-better-cache-locality-than-linked-list/

```typescript
class Stack<T> {
  data: T[];

  constructor() {
    this.data = [];
  }

  // O(1) time complexity
  push(value: T): this {
    this.data.push(value);

    return this;
  }

  // O(1) time complexity
  pop(): T | null {
    return this.data.pop() ?? null;
  }

  // O(1) time complexity
  peek(): T | null {
    return this.data.at(-1) ?? null;
  }

  // O(1) time complexity
  isEmpty(): boolean {
    return this.data.length === 0;
  }

  // O(1) time complexity
  length(): number {
    return this.data.length;
  }
}
```

---
## Техники

---
## Рецепты

[[Циклическое удаление подстрок]]
[[234#Решение 3#|Определение на палиндром]]

---
## Сложные задачи на стек

[[735|Asteroid Collision]]

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
