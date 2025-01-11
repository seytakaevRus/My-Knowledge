---
tags:
  - leetcode
---
## Операции над `двусвязным списком`

### Создание

```typescript
const doublyLinkedList = new DoublyLinkedList();
```

### Получение длины `O(1)` / `O(n)`

Часто у списка нет длины, поэтому для её получении нужно перебирать весь список, что соответствует `O(n)`. В реализации ниже длина была добавлена, как свойство, чтобы её получение было за `O(1)`.

```typescript
doublyLinkedList.length;
```

### Получение по индексу `O(n)`

Чтобы получить узел по индексу, нужно перебрать весь список.

```typescript
doublyLinkedList.getNodeByIndex(3);
```

### Поиск узла по значению `O(n)` / Перебор списка `O(n)`

Чтобы получить узел по значению, нужно перебрать весь список.

```typescript
for (let node = doublyLinkedList.head; node !== null; node = node.next) {
  node.value;
}
```

### Добавление узла в начало `O(1)` / Добавление узла в конец `O(1)`

Чтобы добавить в начало/конец, нужно создать связи нового узла с `head`/`tail` и обновить их.

```typescript
doublyLinkedList.addAtHead(1);
doublyLinkedList.addAtTail(16);
```

### Добавление узла на выбранную позицию `O(n)`

Чтобы добавить узел на выбранную позицию, нужно получить доступ к узлу на этой позиции. В худшем случае это занимает `O(n)`.

```typescript
doublyLinkedList.addAtIndex(1, 2);
```

### Удаление узла с начала `O(1)` / Удаление узла с конца `O(1)`

Чтобы удалить узел с начала / с конца, нужно обновить связи нового узла и `head` / `tail` и обновить `head` / `tail`. Благодаря тому, что теперь есть `prev`, можно удаление сделать за `O(1)`.

```typescript
doublyLinkedList.deleteAtIndex(0);
```

### Удаление узла с выбранной позиции `O(n)`

Чтобы удалить узел с выбранной позиции, нужно получить доступ к узлу, который стоит перед выбранной позиции, а для этого нужно перебрать список.

```typescript
doublyLinkedList.deleteAtIndex(2);
```

---
## Реализация

В высокоуровневых языках программирования, таких как `JavaScript`, `сборка мусора` проводится автоматически, сборщик руководствуется алгоритмом [[Управление памятью#Алгоритм сборки мусора - маркировка и очистка|маркировка и очистка]], поэтому чтобы узел был удален из памяти достаточно, чтобы на этот узел не было ссылок. Даже, если этот узел будет куда-то указывать, но на него нет ссылок, сборщик его уничтожит.

Но в низкоуровневых языках, таких как `C`, `сборка мусора` проводится программистом, поэтому если не очищать память, это может привести к её утечкам.

TODO: Сделать реализацию двусвязного циклического списка вместе с фиктивной головой.

```typescript
class ListNode {
  value: unknown;
  next: ListNode | null;
  prev: ListNode | null;

  constructor(value: unknown = null, next: ListNode | null = null, prev: ListNode | null = null) {
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

class DoublyLinkedList {
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

    node.prev = this.tail;
    this.tail = node;

    this.length += 1;

    this._updateHead();

    return this;
  }

  // O(1) time
  addAtHead(value: unknown): this {
    const node = new ListNode(value);

    if (this.head !== null) {
      this.head.prev = node;
    }

    node.next = this.head;
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
      const node = new ListNode(value);
      const nodeBeforeAdd = this.getNodeByIndex(index - 1);
      const nodeAfterAdd = nodeBeforeAdd!.next;

      nodeBeforeAdd!.next = node;
      nodeAfterAdd!.prev = node;
      node.next = nodeAfterAdd;
      node.prev = nodeBeforeAdd;

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

    if (index === 0) {
      const newHead = this.head!.next;

      newHead!.prev = null;
      this.head!.next = null;
      this.head = newHead;
    } else if (index === this.length - 1) {
      const newTail = this.tail!.prev;

      newTail!.next = null;
      this.tail!.prev = null;
      this.tail = newTail;
    } else {
      const nodeBeforeDelete = this.getNodeByIndex(index - 1);
      const nodeToDelete = nodeBeforeDelete!.next;
      const nodeAfterDelete = nodeToDelete!.next;

      nodeToDelete!.next = null;
      nodeToDelete!.prev = null;
      nodeBeforeDelete!.next = nodeAfterDelete;
      nodeAfterDelete!.prev = nodeBeforeDelete;
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

const doublyLinkedList = new DoublyLinkedList();

doublyLinkedList
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

console.log(doublyLinkedList);
```

---
## Техники

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
