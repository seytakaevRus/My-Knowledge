---
refs:
  - https://typehero.dev/challenge/tuple-to-union
---
## Описание

Нужно реализовать дженерик `TupleToUnion<Tuple>`, который принимает как параметр кортеж и возвращает объединение из его элементов.


```ts
type Arr = ['1', '2', '3']

type Test = TupleToUnion<Arr> // '1' | '2' | '3'
```
 ---
## Решение 1

Можно использовать доступ к свойству `number`, [[Tuples (кортежи)#^8b4b0b|его использование]] как раз возвращает объединение из элементов.

```ts
type TupleToUnion<Tuple extends readonly unknown[]> = Tuple[number];

type A = TupleToUnion<[123, '456', true]>; // true | 123 | "456"
type B = TupleToUnion<[123]>; // 123
```

---
## Решение 2

TODO: Вставить ссылку на рекурсивный обход массива.

Можно использовать [[Infer]] и рекурсивный обход массива. Используя `[infer FirstItem, ...infer Rest]`, можно получить тип первого элемента и массив оставшихся типов, и если перед нами массив, то мы возвращает объединение из первого элемента и рекурсивного вызова `TupleToUnion`, в который прокидывает остаток от массива.

```ts
type TupleToUnion<Tuple extends readonly unknown[]> = Tuple extends [infer FirstItem, ...infer Rest] ? FirstItem | TupleToUnion<Rest> : never;
```