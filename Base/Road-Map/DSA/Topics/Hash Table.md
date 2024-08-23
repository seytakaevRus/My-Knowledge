---
tags:
  - leetcode
date: 2024-06-06
author: Ruslan Seit-Akaev
---
## Описание

`Хеш-таблица` - является ассоциативным массивом, элементы которого могут представлять из себя:
- пары ключ-значения (`хеш-таблица` с открытой адресацией);
- списки пар ключ-значение (`хеш-таблица` со списками).

Выполнение операций в `хеш-таблице` начинается с вычисления `хеш-функции` от ключа. Полученное значение играет роль индекса, далее выполняется операция (добавление, удаление или поиск), которая применяется к паре, лежащей по индексу. 

`Хеш-функция` - функция, которая генерирует значение фиксированной длины (`хеш`) для каждого входящего значения. Особенности `хеш-функции`:
- работает только в одном направлении, а значит восстановить значение из `хеша` невозможно
- при одинаковом входном значении возвращает одинаковый `хеш`.

`Хеш-функция` также должна:
- быть быстрой, чтобы процесс создание хеша не занимал много времени;
- быть максимально устойчивой к коллизиям.

Как было показано выше есть два способа реализации `хеш-таблицы`. Помимо значений, которые хранятся по `хешу` способы реализаций также различаются методом решений коллизий.

`Коллизия` -  ситуация, когда `хеш-функция` для двух ключей дает один и тот же `хеш`.

`Фактор загрузки` - значение, которое вычисляется как `n/b`, где `n` - количество записей внутри таблицы, а `b` - количество сегментов. При высокой загрузке в какой-то сегмент может поступать много элементов (`хеш-таблица` со списками) или происходить много коллизий (`хеш-таблица` с открытой адресацией), а значит в этом сегменте увеличится время поиска элемента (`хеш-таблица` со списками) или увеличится время поиска свободного сегмента (`хеш-таблица` с открытой адресацией), поэтому хорошей практикой является держать `фактор загрузки` маленьким, а если он больше `0.75`, то происходит `рехеширование`.

`Рехеширование` - процесс, при котором увеличивается размер `хеш-таблицы` и идет перераспределение элементов в ячейки, основываясь на новом значении `хеша`. Это выполняется, чтобы увеличить производительность таблицы и уменьшить встречаемость коллизий, вызванной из-за высокого `фактора загрузки`.

Подробнее про `рехеширование` тут: https://www.geeksforgeeks.org/load-factor-and-rehashing/?ref=lbp

В `JavaScript` способами представления `хеш-таблицы` являются `Object` и `Map`.

`Хеш-таблица` по памяти занимает `O(n)`, где `n` - количество записей.

Подробнее про то, что конкретно использовать можно глянуть здесь [[Object vs Map]].

### `Хеш-таблица` с открытой адресацией

Идея состоит в том, чтобы по хешу хранить пары значений. 

![[DSA_Hash-Table_1.png]]

Размер таблицы должен быть больше или равен, количеству элементов, которые она будет хранить. В случае коллизии для поиска новой ячейки используется следующий варианты зондирования:

- Линейной зондирование;
- Квадратичное зондирование;
- Двойное хеширование.

Подробно про эти варианты будет ниже, а пока стоит рассмотреть что из себя представляют операции `вставки`, `поиска`, `удаления`.

- `Insert(key, value):` Продолжать зондирование, пока она не будет найдена, если пустая ячейка найдена, то вставляем пару ключ-значения. Если найдена пара, у которой ключ равен переданному ключу, то просто обновляем значение;
- `Search(key)`: Продолжать зондирование, пока ячейка с парой, у которой нужный ключ, не будет найдена или не будет найдена пустая ячейка (значит такого ключа в таблице нет);
- `Delete(key)`: Эта операция сделана интересно. Если мы просто вместо пары поставим пустое значение, то операция поиска упадет. Поэтому вместо пустой ячейки при удалении ставится маркер "была удалена". Важно отметить, что в удаленную ячейку можно вставить новую пару, но поиск на такой ячейке не остановится.

#### Линейное зондирование

В линейном зондировании поиск новой ячейки производится последовательно, начиная с оригинального хеша. Если на этом месте нет нужной ячейки, то идет проверка следующей ячейки:

```
Пусть hash(x) будет оригинальным хешом, который был получен из хеш-функции и S размер таблицы

Если ячейка hash(x) % S занята, то мы пробуем (hash(x) + 1) % S
Если ячейка (hash(x) + 1) % S занята, то мы пробуем (hash(x) + 2) % S
Если ячейка (hash(x) + 2) % S занята, то мы пробуем (hash(x) + 3) % S
```

#### Квадратичное зондирование

Поиск также начинается с новой ячейки, начиная с оригинального хеша. Если на этом месте нет нужной ячейки, то идет проверка следующей ячейки:

```
Пусть hash(x) будет оригинальным хешом, который был получен из хеш-функции и S размер таблицы

Если ячейка hash(x) % S занята, то мы пробуем (hash(x) + 1*1) % S
Если ячейка (hash(x) + 1*1) % S занята, то мы пробуем (hash(x) + 2*2) % S
Если ячейка (hash(x) + 2*2) % S занята, то мы пробуем (hash(x) + 3*3) % S
```

#### Двойное хеширование

Используя, оригинальное значения хеша и значение другой хеш-функции, вычисляется новое значение. Если на этом месте нет нужной ячейки, то идет проверка следующей ячейки:

```
Пусть hash(x) будет оригинальным хешом, который был получен из хеш-функции и S размер таблицы

Если ячейка hash(x) % S занята, то мы пробуем (hash(x) + 1*hash2(x)) % S
Если ячейка (hash(x) + 1*hash2(x)) % S занята, то мы пробуем (hash(x) + 2*hash2(x)) % S
Если ячейка (hash(x) + 2*hash2(x)) % S занята, то мы пробуем (hash(x) + 3*hash2(x)) % S
```

Варианты зондирования отличаются степенью созданием кластером. `Линейное зондирование` создает кластеров больше всего, `двойное хеширование` почти не создает кластеров, а `квадратичное зондирование` по созданию кластеров лежит между ними.

TODO: LRU Cache это сюда?
### `Хеш-таблица` со списками

Идея состоит в том, чтобы по хешу хранить список, который будет в себе содержать пары ключ и значение. Если два ключа дают одинаковый хеш, то эти пары мы будем хранить в списке.

![[DSA_Hash-Table_2.png]]

Структуры данных, которые можно использовать в качестве списков:

- Массивы;
- Связные списки;
- Балансированные деревья `BST` (`AVL деревья`, `красно черные деревья`).

`+`:

- Просто сделать;
- Можно не думать о том, что таблица может быть заполнена, всегда можно добавить в список больше элементов;
- Менее чувствительна к распределению `хеш-функций` или `фактору загрузки`;
- Обычно используется, когда не известно как много и как часто ключи могут быть добавлены или удалены;

`-`:

- Если список становится слишком большим, то поиск в нем может занимать `O(n)`;
- Может использовать дополнительную память в зависимости от выбранной структуры.

[[Hash Table#Хеш-таблица со списками (массивы)|Реализация через массивы]]
[[Hash Table#Хеш-таблица со списками (связных списков)|Реализация через связный список]]

---
## Особенности

## Плюсы

- быстрый поиск (нужна хорошая устойчивость к коллизиям);
- быстрое добавление/удаление (нужна хорошая устойчивость к коллизиям);
### Минусы

- элементы не имеют порядок;
- при больших количествах коллизии все операции замедляются.

---
## Операции над `хеш-таблицей`

### Создание

```typescript
const hashMap = {
  'a': 0,
  'c': 15,
  'r': 8,
  'z': 'sock',
};

const map = new Map([['a', 0], ['c', 15], ['r', 8], ['z', 'sock']]);
```

### Добавление ключа `O(1)`/`O(n)` при коллизиях

```typescript
hashMap.key = 'value';
hashMap['key'] = 'value';

map.set('key', 'value');
```

### Поиск элемента по ключу `O(1)`/`O(n)` при коллизиях

```typescript
hashMap.key;
hashMap['key'];

map.get('key');
```

### Удаление элемента по ключу `O(1)`/`O(n)` при коллизиях

```typescript
// delete рекомендуется не использовать, так как он делает обращаение с объектом медленным.
hashMap.key = null;
hashMap['key'] = null;

map.delete('key');
```

---
## Реализация

### Хеш-таблица со списками (массивы)

```typescript
type Pair<T> = [string, T];

class HashMap {
  data: Pair<unknown>[][];
  size: number;

  constructor(length: number = 1000) {
    this.data = new Array(length);
    this.size = 0;
  }

  #getHash(key: unknown): number {
    let hash = 0;

    for (const letter of String(key)) {
      hash += letter.charCodeAt(0);
    }

    return hash % this.data.length;
  }

  put(key: unknown, value: unknown): this {
    const hash = this.#getHash(key);

    if (this.data[hash] === undefined) {
      this.data[hash] = [];
    }

    const bucket = this.data[hash];

    for (let i = 0; i < this.data[hash].length; i += 1) {
      if (bucket[i][0] === String(key)) {
        bucket[i][1] = value;

        return this;
      }
    }

    bucket.push([String(key), value]);
    this.size += 1;

    return this;
  }

  get(key: unknown): unknown | number {
    const hash = this.#getHash(key);
    const bucket = this.data[hash];

    if (bucket === undefined) return -1;

    for (const pair of bucket) {
      if (String(key) === pair[0]) {
        return pair[1];
      }
    }

    return -1;
  }

  remove(key: unknown): this {
    const hash = this.#getHash(key);
    const bucket = this.data[hash];

    if (bucket === undefined) return this;

    for (let i = 0; i < bucket.length; i += 1) {
      if (String(key) === bucket[i][0]) {
        bucket.splice(i, 1);

        this.size -= 1;

        break;
      }
    }

    return this;
  }
}
```

### Хеш-таблица со списками (связных списков)

```typescript
type NullableListNode = ListNode | null;

class ListNode {
  key: string;
  value: unknown;
  next: NullableListNode;

  constructor(
    key: unknown = null,
    value: unknown = null,
    next: NullableListNode = null
  ) {
    this.key = String(key);
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  #dummy: ListNode;
  size: number;

  constructor() {
    this.#dummy = new ListNode();
    this.size = 0;
  }

  get head(): NullableListNode {
    return this.#dummy.next;
  }

  addAtHead(key: unknown, value: unknown): void {
    const node = new ListNode(key, value, this.#dummy.next);

    this.#dummy.next = node;

    this.size += 1;
  }

  updateNodeValue(key: unknown, value: unknown): boolean {
    for (let node = this.head; node !== null; node = node.next) {
      if (node.key === String(key)) {
        node.value = value;

        return true;
      }
    }

    return false;
  }

  removeByKey(key: unknown): boolean {
    let nodeBeforeDelete = null;

    for (
      let node: NullableListNode = this.#dummy;
      node.next !== null;
      node = node.next
    ) {
      if (node.next.key === String(key)) {
        nodeBeforeDelete = node;
      }
    }

    if (nodeBeforeDelete === null) return false;

    nodeBeforeDelete.next = nodeBeforeDelete.next?.next ?? null;

    this.size -= 1;

    return true;
  }

  getValuByKey(key: unknown): unknown | number {
    for (let node = this.head; node !== null; node = node.next) {
      if (node.key === String(key)) {
        return node.value;
      }
    }

    return -1;
  }
}

class HashMap {
  data: (LinkedList | undefined)[];
  size: number;

  constructor(length: number = 1000) {
    this.data = new Array(length);
    this.size = 0;
  }

  #getHash(key: unknown): number {
    let hash = 0;

    for (const letter of String(key)) {
      hash += letter.charCodeAt(0);
    }

    return hash % this.data.length;
  }

  put(key: unknown, value: unknown): this {
    const hash = this.#getHash(key);

    if (this.data[hash] === undefined) {
      this.data[hash] = new LinkedList();
    }

    const bucket = this.data[hash];

    const nodeWasUpdated = bucket.updateNodeValue(key, value);

    if (nodeWasUpdated) {
      return this;
    }

    bucket.addAtHead(key, value);

    this.size += 1;

    return this;
  }

  get(key: unknown): unknown | number {
    const hash = this.#getHash(key);
    const bucket = this.data[hash];

    if (bucket === undefined) return -1;

    return bucket.getValuByKey(key);
  }

  remove(key: unknown): this {
    const hash = this.#getHash(key);
    const bucket = this.data[hash];

    if (bucket === undefined) return this;

    const nodeWasRemoved = bucket.removeByKey(key);

    if (nodeWasRemoved) {
      this.size -= 1;
    }

    return this;
  }
}
```

### Хеш-таблица с открытой адресацией

TODO: Написать про важность метода `_hash`

```typescript
type Pair<T> = [string, T];
type ResolveCollisionArguments = {
  startHash: number;
  iteration: number;
  secondHash: number;
  dataLength: number;
};

const RESOLVE_COLLISIONS_VARIANTS = {
  LINEAR_PROBING: "LINEAR_PROBING",
  QUADRATIC_PROBING: "QUADRATIC_PROBING",
  DOUBLE_HASHING: "DOUBLE_HASHING",
} as const;

class MyHashMap {
  data: (Pair<unknown> | "wasDeleted")[];
  size: number;

  constructor(length: number = 10001) {
    this.data = new Array(length);
    this.size = 0;
  }

  #getHash(key: unknown): number {
    const stringKey = String(key);

    let hash = 0;

    for (const letter of stringKey) {
      hash = (37 * hash + letter.charCodeAt(0)) % this.data.length;
    }

    return hash;
  }

  #getHash2(key: unknown): number {
    const stringKey = String(key);

    let hash = 0;

    for (const letter of stringKey) {
      hash = (29 * hash + letter.charCodeAt(0)) % this.data.length;
    }

    return 10067 - (hash % 10067);
  }

  [RESOLVE_COLLISIONS_VARIANTS.LINEAR_PROBING]({
    startHash,
    iteration,
    dataLength,
  }: ResolveCollisionArguments): number {
    return (startHash + iteration) % dataLength;
  }

  [RESOLVE_COLLISIONS_VARIANTS.QUADRATIC_PROBING]({
    startHash,
    iteration,
    dataLength,
  }: ResolveCollisionArguments): number {
    return (startHash + iteration * iteration) % dataLength;
  }

  [RESOLVE_COLLISIONS_VARIANTS.DOUBLE_HASHING]({
    startHash,
    iteration,
    secondHash,
    dataLength,
  }: ResolveCollisionArguments): number {
    return (startHash + iteration * secondHash) % dataLength;
  }

  #getNextHash(
    variant: keyof typeof RESOLVE_COLLISIONS_VARIANTS,
    args: ResolveCollisionArguments
  ): number {
    return this[variant](args);
  }

  #probingForGet(
    key: unknown,
    variant: keyof typeof RESOLVE_COLLISIONS_VARIANTS
  ): number | null {
    const startHash = this.#getHash(key);
    const secondHash = this.#getHash2(key);
    const stringKey = String(key);

    for (let hash = startHash, i = 1; i < this.data.length; i += 1) {
      if (this.data[hash] === undefined) return null;

      if (this.data[hash][0] === stringKey) {
        return hash;
      }

      hash = this.#getNextHash(variant, {
        startHash,
        secondHash,
        dataLength: this.data.length,
        iteration: i,
      });
    }

    return null;
  }

  #probingForRemove(
    key: unknown,
    variant: keyof typeof RESOLVE_COLLISIONS_VARIANTS
  ): number | null {
    const startHash = this.#getHash(key);
    const secondHash = this.#getHash2(key);
    const stringKey = String(key);

    for (let hash = startHash, i = 1; i < this.data.length; i += 1) {
      if (this.data[hash] === undefined) return null;

      if (this.data[hash][0] === stringKey) {
        return hash;
      }

      hash = this.#getNextHash(variant, {
        startHash,
        secondHash,
        dataLength: this.data.length,
        iteration: i,
      });
    }

    return null;
  }

  #probingForPut(
    key: unknown,
    variant: keyof typeof RESOLVE_COLLISIONS_VARIANTS
  ): number | null {
    const startHash = this.#getHash(key);
    const secondHash = this.#getHash2(key);
    const stringKey = String(key);

    for (let hash = startHash, i = 1; i < this.data.length; i += 1) {
      if (
        this.data[hash] === undefined ||
        this.data[hash] === "wasDeleted" ||
        this.data[hash][0] === stringKey
      ) {
        return hash;
      }

      hash = this.#getNextHash(variant, {
        startHash,
        secondHash,
        dataLength: this.data.length,
        iteration: i,
      });
    }

    return null;
  }

  put(key: unknown, value: unknown): this {
    if (value === "wasDeleted")
      throw new Error('Hash Table can"t store such value');

    const hash = this.#probingForPut(
      key,
      RESOLVE_COLLISIONS_VARIANTS.DOUBLE_HASHING
    );

    if (hash === null) {
      if (this.size === this.data.length) {
        throw new Error("Hash Table is full");
      } else {
        return this;
      }
    }

    if (this.data[hash] === undefined || this.data[hash] === "wasDeleted") {
      this.size += 1;
    }

    this.data[hash] = [String(key), value];

    return this;
  }

  get(key: unknown): unknown | number {
    const hash = this.#probingForGet(
      key,
      RESOLVE_COLLISIONS_VARIANTS.DOUBLE_HASHING
    );

    if (hash === null) return -1;

    return this.data[hash][1];
  }

  remove(key: unknown): this {
    const hash = this.#probingForRemove(
      key,
      RESOLVE_COLLISIONS_VARIANTS.DOUBLE_HASHING
    );

    if (hash === null) return this;

    this.data[hash] = "wasDeleted";

    this.size -= 1;

    return this;
  }
}
```

---
## Техники

---
## Первая не решенная задача, с большего `Acceptance` к меньшему

https://leetcode.com/problems/find-the-number-of-good-pairs-i/

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
