---
tags:
  - leetcode
date: 2024-04-14
author: Ruslan Seit-Akaev
---
## Описание

`Массив` - базовая структура для последовательного хранения элементов. Элементы в памяти хранятся рядом с ячейках памяти. Доступ к элементам возможен по индексам.

Массив может одномерным или многомерным.

Одномерный массив:
![[DSA_Array.png]]

В массиве `A` выше есть 6 элементов. Он имеет длину 6, чтобы обратиться к первому элементу используется запись `A[0]`, к последнему `A[5]` или `A[A.length - 1]`.

По расширяемости есть:
1. `Статический массив` - массив, у которого размер не может быть увеличен позже;
2. `Динамический массив` -  массив, у которого размер может быть изменен.

Но в `JavaScript` массивы динамические, да и размер не нужно указывать заранее.

---
## Операции над массивом

### Создание

```typescript
const array = [1, 6, 3, 10, 5];
```
### Получение длины `O(1)`

```typescript
console.log(array.length);
```
### Получение по индексу `O(1)`

```typescript
console.log(array[0]);
console.log(array[2]);
console.log(array[5]);
```

### Поиск элемента по значению `O(n)`

```typescript
for (let i = 0; i < array.length; i += 1) {
  console.log(array[i]);    
}
```
### Удаление элемента с конца / Добавление элемента в конец `O(1)`

```typescript
array.pop();
array.push(5)
```

### Удаление элемента с начала / Добавление элемента в начало `O(n)`

Так как после удаления/добавления первого элемента, оставшиеся элементы сдвигаются.

```typescript
array.shift();
array.unshift(5)
```
### Удаление элемента со случайно позиции / Добавление элемента на случайную позицию `O(n)`

Так как после удаления/добавления с произвольного места/в произвольное место элементы справа будут сдвигаться.

```typescript
array.splice(index, 1);
array.splice(index, 0, 5);
```

### Сдвиг элементов массива вправо, начиная с индекса `O(n)`

 Изначально в `prev` записывается элемент, с которого начинается сдвиг (`index`). Модификация массива начинается с индекса `index + 1`. На каждой итерации цикла в `current` записывается текущий элемент, вместо текущего элемента берется предыдущий элемент `prev`, и в предыдущий элемент заносится текущий.

```typescript
const shiftElementsToRightFromIndex = (arr: number[], index: number): void => {
  let prev = arr[index];
  let current;

  for (let i = index + 1; i < arr.length; i += 1) {
    current = arr[i];
    arr[i] = prev;
    prev = current;
  }
};
```

### Циклический сдвиг элементов массива вправо

Принцип тот же, что и выше, только `index = 0` и сохраняем последний элемент, чтобы после циклического сдвига поставить его на первое место.

```typescript
const cycleShiftElementsToRight = (arr: number[]): void => {
  const last = arr[arr.length - 1];

  let prev = arr[0];
  let current;

  for (let i = 1; i < arr.length; i += 1) {
    current = arr[i];
    arr[i] = prev;
    prev = current;
  }

  arr[0] = last
};
```

### Сдвиг элементов массива влево, начиная с индекса `O(n)`

Изначально в `prev` записывается элемент, с которого начинается сдвиг (`index`). Модификация массива начинается с индекса `index - 1`. На каждой итерации цикла в `current` записывается текущий элемент, вместо текущего элемента берется предыдущий элемент `prev`, и в предыдущий элемент заносится текущий.

```typescript
const shiftElementsToLeftFromIndex = (arr: number[], index: number): void => {
  let prev = arr[index];
  let current;

  for (let i = index - 1; i >= 0; i -= 1) {
    current = arr[i];
    arr[i] = prev;
    prev = current;
  }
};
```

### Циклический сдвиг элементов массива влево

Принцип тот же, что и выше, только `index = arr.length - 1` и сохраняем первый элемент, чтобы после циклического сдвига поставить его на последнее место.

```typescript
const cycleShiftElementsToLeft = (arr: number[]): void => {
  const first = arr[0];

  let prev = arr[arr.length - 1];
  let current;

  for (let i = arr.length - 2; i >= 0; i -= 1) {
    current = arr[i];
    arr[i] = prev;
    prev = current;
  }

  arr[arr.length - 1] = first;
};
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