
`Кортеж` - неизменяемый массив, поэтому к нему добавляется модификатор `readonly` и меняется поведение в некоторых ситуациях.
## Создание

`as const` к массиву даёт кортеж. Кортеж возвращает литералы, а не типы. 

```ts
const array = [1, "2", true, null] // (string | number | boolean | null)[]
const tuple = [1, "2", true, null] as const; // readonly [1, "2", true, null]
```

Также, теперь при использовании `tuple["length"]` возвращается литерал, а не просто тип `number`.

```ts
type TupleLength = typeof tuple["length"]; // 4
```

^Также, если использовать `tuple[number]` или `tuple[0]` (или любой другой индекс), то получим юнион из литералов, а не из типов. ^8b4b0b

```ts
type TupleItems1 = typeof tuple[number]; // true | 1 | "2" | null
type TupleItems2 = typeof tuple[0]; // true | 1 | "2" | null
```

Применение `keyof` на кортеж вернёт `number` (в него собираются индексы), литералы индексов в виде строк и методы со свойствами из `Array.prototype`, исключая те, которые могут изменять массив `push`, `pop`, ...

```ts
const tuple = [1, "2", true, null] as const;

type TupleKeys = keyof typeof tuple;

type ExtractNumber = Extract<TupleKeys, number>; // number
type ExtractString = Extract<TupleKeys, string>; // "2" | "0" | "1" | "3" | "length" | "toString" | ...
type ExtractPush = Extract<TupleKeys, "push">; // never
type ExtractSlice = Extract<TupleKeys, "slice">; // "slice"
```

> Редко когда применяется `keyof` на кортежи.

Если нужно, чтобы в дженерик мог передаваться кортеж, то нужно использовать `extends readonly any[]`. Такая запись позволит передавать и массивы, и кортежи.

```ts
type Length<T extends readonly any[]> = T["length"];
```

Для расширения кортежей также нужно использовать оператор `...`.

```ts
type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];
```

https://typehero.dev/challenge/concat
https://typehero.dev/challenge/length-of-tuple