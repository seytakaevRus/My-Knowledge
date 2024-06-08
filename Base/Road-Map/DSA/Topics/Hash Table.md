---
tags:
  - leetcode
date: 2024-06-06
author: Ruslan Seit-Akaev
---
## Описание

`Хеш-таблица` - является ассоциативным массивом, элементы которого:
- пары ключ-значения (`хеш-таблица` с открытой адресацией);
- списки пар ключ-значение (`хеш-таблица` со списками).

Для простоты дальше будет рассматриваться именно хранение пар (открытая адресация).

![[DSA_Hash-Table_1.png]]

Выполнение операций в `хеш-таблице` начинается с вычисления `хеш-функции` от ключа. Полученное значение играет роль индекса, далее выполняется операция (добавление, удаление или поиск), которая применяется к паре, лежащей по индексу. 

`Хеш-функция` - функция, которая генерирует значение фиксированной длины (`хеш`) для каждого входящего значения. Особенности `хеш-функции`:
- работает только в одном направлении, а значит восстановить значение из `хеша` невозможно
- при одинаковом входном значении возвращает одинаковый `хеш`.

`Хеш-функция` также должна:
- быть быстрой, чтобы процесс создание хеша не занимал много времени;
- быть максимально устойчивой к коллизиям.

`Коллизия` -  ситуация, когда `хеш-функция` для двух ключей дает один и тот же `хеш`.

![[DSA_Hash-Table_2.png]]

В `JavaScript` способами представления `хеш-таблицы` являются `Object` и `Map`.

Подробнее про то, что конкретно использовать можно глянуть здесь [[Object vs Map]].

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

```typescript
class HashTable {
  data: [key?: string, value?: unknown][][];

  constructor(size: number) {
    this.data = new Array(size);
  }

  // O(1) time
  _hash(key: string): number {
    let hash = 0;

    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * i) % this.data.length;
    }

    return hash;
  }

  // O(n) time
  get(key: string): unknown {
    const index = this._hash(key);
    const bucket = this.data[index];

    for (const [bucketKey, bucketValue] of bucket) {
      if (key === bucketKey) {
        return bucketValue;
      }
    }
  }

  // O(1) time
  set(key: string, value: unknown): typeof this.data {
    const index = this._hash(key);

    if (this.data[index] === undefined) {
      this.data[index] = [];
    }

    this.data[index].push([key, value]);

    return this.data;
  }

  // O(n * k) time
  keys(): string[] {
    const keys: string[] = [];

    for (const bucket of this.data) {
      if (bucket === undefined) continue;
      
      for (const [key] of bucket) {
        keys.push(key!);
      }
    }

    return keys;
  }
}

const myHashTable = new HashTable(50);
myHashTable.set("grapes", 10000);
myHashTable.get("grapes");
myHashTable.set("apples", 9);
myHashTable.get("apples");
myHashTable.set("1234s22416426rfy7uggrgol;[sa,pk3", 123084578);
myHashTable.get("1234s22416426rfy7uggrgol;[sa,pk3");

console.log(myHashTable.keys());
```

---
## Техники

TODO: Написать про операции на месте.

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
