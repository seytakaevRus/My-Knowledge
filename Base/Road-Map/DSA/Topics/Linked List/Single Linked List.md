---
tags:
  - leetcode
---
## Операции над `односвязным списком`

### Создание

```typescript
const linkedList = new LinkedList();
```

### Получение длины `O(1)` / `O(n)`

Часто у списка нет длины, поэтому для её получении нужно перебирать весь список, что соответствует `O(n)`. В реализации ниже длина была добавлена, как свойство, чтобы её получение было за `O(1)`.

```typescript
linkedList.length;
```

### Получение по индексу `O(n)`

Чтобы получить узел по индексу, нужно перебрать весь список.

```typescript
linkedList.getNodeByIndex(3);
```

### Поиск узла по значению `O(n)` / Перебор списка `O(n)`

Чтобы получить узел по значению, нужно перебрать весь список.

```typescript
for (let node = linkedList.head; node !== null; node = node.next) {
  node.value;
}
```

### Добавление узла в начало `O(1)` / Добавление узла в конец `O(1)`

Чтобы добавить в начало/конец, нужно создать связи нового узла с `head`/`tail` и обновить их.

```typescript
linkedList.addAtHead(1);
linkedList.addAtTail(16);
```

### Добавление узла на выбранную позицию `O(n)`

Чтобы добавить узел на выбранную позицию, нужно получить доступ к узлу на этой позиции. В худшем случае это занимает `O(n)`.

```typescript
linkedList.addAtIndex(1, 2);
```

### Удаление узла с начала `O(1)`

Чтобы удалить узел с начала, нужно обновить связи нового узла и `head` и обновить `head`.

```typescript
linkedList.deleteAtIndex(0);
```

### Удаление узла с выбранной позиции `O(n)` /  Удалить с конца `O(n)`

Чтобы удалить узел с выбранной позиции / с конца, нужно получить доступ к узлу, который стоит перед выбранной позиции / концом, а для этого нужно перебрать список.

```typescript
linkedList.deleteAtIndex(2);
```

---
## Реализация

В высокоуровневых языках программирования, таких как `JavaScript`, `сборка мусора` проводится автоматически, сборщик руководствуется алгоритмом [[Управление памятью#Алгоритм сборки мусора - маркировка и очистка|маркировка и очистка]], поэтому чтобы узел был удален из памяти достаточно, чтобы на этот узел не было ссылок. Даже, если этот узел будет куда-то указывать, но на него нет ссылок, сборщик его уничтожит.

Но в низкоуровневых языках, таких как `C`, `сборка мусора` проводится программистом, поэтому если не очищать память, это может привести к её утечкам.

[[Single Linked List#Версия 1|Версия 1]] была написана до изучения этого факта, а [[Single Linked List#Версия 2|Версия 2]] после. Также вторая версия имеет ряд преимуществ над первой.
### Версия 1

```typescript
class ListNode {
  value: unknown;
  next: ListNode | null;

  constructor(value: unknown = null, next: ListNode | null = null) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  head: ListNode | null;
  tail: ListNode | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // O(1) time
  _updateHead() {
    if (this.length === 0 || this.length === 1) {
      this.head = this.tail;
    }
  }

  // O(1) time
  _updateTail() {
    if (this.length === 0 || this.length === 1) {
      this.tail = this.head;
    }
  }

  // O(1) time
  addAtTail(value: unknown): this {
    const node = new ListNode(value);

    if (this.tail !== null) {
      this.tail.next = node;
    }

    this.tail = node;
    this.length += 1;

    this._updateHead();

    return this;
  }

  // O(1) time
  addAtHead(value: unknown): this {
    const node = new ListNode(value, this.head);

    this.head = node;
    this.length += 1;

    this._updateTail();

    return this;
  }

  // O(n) time
  printList(): this {
    const output = [];

    for (let node = this.head; node !== null; node = node.next) {
      output.push(node.value);
    }

    console.log(output);

    return this;
  }

  // O(n) time
  addAtIndex(index: number, value: unknown): this {
    if (index <= 0) {
      this.addAtHead(value);
    } else if (index >= this.length) {
      this.addAtTail(value);
    } else {
      const nodeBeforeAdd = this.getNodeByIndex(index - 1);
      const nodeAfterAdd = nodeBeforeAdd!.next;
      const node = new ListNode(value, nodeAfterAdd);

      nodeBeforeAdd!.next = node;

      this.length += 1;
    }

    return this;
  }

  // O(n) time
  deleteAtIndex(index: number): this {
    if (index < 0 || index >= this.length) return this;

    if (this.length === 1) {
      this.head = null;
      this.tail = null;
      this.length = 0;

      return this;
    }

    const nodeBeforeDelete = this.getNodeByIndex(index - 1);

    if (index === 0) {
      const newHead = this.head!.next;

      this.head!.next = null;
      this.head = newHead;
    } else if (index === this.length - 1) {
      const newTail = nodeBeforeDelete;

      newTail!.next = null;
      this.tail = newTail;
    } else {
      const nodeToDelete = nodeBeforeDelete!.next
      const nodeAfterDelete = nodeToDelete!.next;

      nodeToDelete!.next = null;
      nodeBeforeDelete!.next = nodeAfterDelete;
    }

    this.length -= 1;

    this._updateHead();
    this._updateTail();

    return this;
  }

  // O(n) time
  getValueByIndex(index: number): unknown {
    for (let node = this.head, i = 0; node !== null; node = node.next, i += 1) {
      if (i === index) {
        return node.value;
      }
    }

    return -1;
  }
  
  // O(n) time
  getNodeByIndex(index: number): ListNode | null {
    for (let node = this.head, i = 0; node !== null; node = node.next, i += 1) {
      if (i === index) {
        return node;
      }
    }

    return null;
  }
}

const linkedList = new LinkedList();

linkedList
  .addAtTail(16)
  .addAtHead(1)
  .addAtIndex(-1, 100)
  .addAtIndex(15, 89)
  .addAtIndex(0, 15)
  .addAtIndex(0, 35)
  .addAtIndex(1, 2)
  .printList()
  .deleteAtIndex(1)
  .printList();

console.log(linkedList);
```

### Версия 2

Эта версия является улучшенным вариантом реализации связного списка.

+:

- Нет излишних удалений для `JS`, как было в `Версия 1`;
- Использован рецепт [[Фиктивная голова связного списка]], что позволило улучшить читаемость кода и уменьшить количество строчек;
- `head` и `tail` сделаны в качестве геттеров, которые будут всегда возвращать актуальное значение, а значит нет нужны в обновлении свойств `head` и `tail`, как было в `Версия 1`. Вместо них используется `#dummy`, чье свойство `next` указывает на голову списка;
- При необходимости через сеттеры `head` и `tail` можно расширить интерфейс связного списка и добавлять узлы с существующим у них свойством `next`.

-:

- Порог вхождения выше;
- Добавление узла в хвост списка теперь занимает `O(n)` по времени;
- Получение хвоста списка занимает `O(n)` по времени.

```typescript
type NullableListNode = ListNode | null;

class ListNode {
  value: unknown;
  next: NullableListNode;

  constructor(value: unknown = null, next: NullableListNode = null) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  #dummy: ListNode;
  length: number;

  constructor() {
    this.#dummy = new ListNode();
    this.length = 0;
  }

  // O(1) time
  get head(): NullableListNode {
    return this.#dummy.next;
  }

  // O(n) time
  get tail(): NullableListNode {
    for (let node = this.head; node !== null; node = node.next) {
      if (node.next === null) {
        return node;
      }
    }

    return null;
  }

  // O(n) time
  #getNodeAtIndex(index: number): NullableListNode {
    for (
      let node: NullableListNode = this.#dummy, i = 0;
      node !== null;
      node = node.next, i += 1
    ) {
      if (i === index) {
        return node;
      }
    }

    return null;
  }

  // O(n) time
  addAtTail(value: unknown): this {
    return this.addAtIndex(this.length, value);
  }

  // O(1) time
  addAtHead(value: unknown): this {
    return this.addAtIndex(0, value);
  }

  // O(n) time
  printList(): this {
    const output = [];

    for (let node = this.head; node !== null; node = node.next) {
      output.push(node.value);
    }

    console.log(output);

    return this;
  }

  // O(n) time
  addAtIndex(index: number, value: unknown): this {
    let correctIndex = index;

    if (index <= 0) correctIndex = 0;
    else if (index >= this.length) correctIndex = this.length;

    const nodeBeforeAdd = this.#getNodeAtIndex(correctIndex);
    const nodeAfterAdd = nodeBeforeAdd!.next;
    const node = new ListNode(value, nodeAfterAdd);

    nodeBeforeAdd!.next = node;

    this.length += 1;

    return this;
  }

  // O(n) time
  deleteAtIndex(index: number): this {
    if (index < 0 || index >= this.length) return this;

    const nodeBeforeDelete = this.#getNodeAtIndex(index);
    const nodeAfterDelete = nodeBeforeDelete!.next?.next ?? null;

    nodeBeforeDelete!.next = nodeAfterDelete;

    this.length -= 1;

    return this;
  }

  // O(n) time
  getValueAtIndex(index: number): unknown {
    for (
      let node = this.head, i = 0;
      node !== null;
      node = node.next, i += 1
    ) {
      if (i === index) {
        return node.value;
      }
    }

    return -1;
  }
}

const linkedList = new LinkedList();

linkedList
  .addAtTail(16)
  .addAtHead(1)
  .addAtIndex(-1, 100)
  .addAtIndex(15, 89)
  .addAtIndex(0, 15)
  .addAtIndex(0, 35)
  .addAtIndex(1, 2)
  .printList()
  .deleteAtIndex(1)
  .printList();
```

---
## Техники

[[Быстрый и медленный указатель]]

---
## Рецепты

[[Фиктивная голова связного списка]]
[[Реверсирование связного списка]]

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
