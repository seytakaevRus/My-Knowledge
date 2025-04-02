---
refs:
  - https://typehero.dev/challenge/includes
---
## Описание

Нужно написать функцию `Array.includes`, но для системы типов. Она принимает два аргумента, тип массива и тип элемента. Производит [[Strict type equality (строгое равенство типов)|строгое сравнение]]. Возвращает либо `false`, либо `true`.

```ts
type isPillarMen = Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'> // false
```

---
## Решение 1

Первая идея, которая пришла в голову была использовать `Array[number]`, чтобы получить объединение из типов элементов в массиве, а затем проходимся по каждому элементу, используя [[Mapped array types (перебор типа массива или кортежа)|перебор массива]].

Но, если в массиве будет тип, например, `boolean`, который при распределении распадается на другие типы, `true` и `false`, то код корректно не будет работать ([[Easy#Типы, которые могут распадаться на более простые|типы, которые могут распадаться]]). Поэтому нужно искать другой подход перебора массива.

Из `JS` мы знаем, что массив можно перебрать итеративно и рекурсивно, раз итеративно не подошло, сделаем это [[Mapped array types (перебор типа массива или кортежа)#При помощи `infer`|рекурсивно]].

Как работает `StrictEqual` можно посмотреть [[Strict type equality (строгое равенство типов)|здесь]].

```ts
type StrictEqual<T, U> = (<G>() => G extends T ? 1 : 0) extends (<G>() => G extends U ? 1 : 0) ? true : false;

type Includes<Array extends readonly unknown[], Item> = Array extends [infer FirstItem, ...infer Rest]
	? StrictEqual<FirstItem, Item> extends true 
		? true
		: Includes<Rest, Item>
	: false;
```
