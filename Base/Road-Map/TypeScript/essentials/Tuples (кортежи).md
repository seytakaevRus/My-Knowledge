
`Кортеж` - неизменяемый массив, поэтому к нему добавляется модификатор `readonly` и меняется поведение в некоторых ситуациях.
## Создание кортежа

`as const` к массиву даёт кортеж. Кортеж возвращает литералы, а не типы. 

```ts
const array = [1, "2", true, null] // (string | number | boolean | null)[]
const tuple = [1, "2", true, null] as const; // readonly [1, "2", true, null]
```

## `tuple["length"]`

`tuple["length"]` возвращается литерал, а не просто тип `number`.

```ts
type TupleLength = typeof tuple["length"]; // 4
```

## `tuple[number]` и `tuple[index]`

`tuple[number]` вернёт объединение из литералов.

```ts
type TupleItems = typeof tuple[number]; // true | 1 | "2" | null
```

`tuple[index]` вернёт конкретный литерал.

```ts
type TupleElement1 = typeof tuple[0]; // 1
type TupleElement2 = typeof tuple[8]; // error + undefined
```

## `keyof`

`keyof` на кортеж вернёт:

- `number` (в него собираются индексы);
- литералы индексов в виде строк;
- методы со свойствами из `Array.prototype`, исключая те, которые могут изменять массив `push`, `pop` и т.д.

```ts
const tuple = [1, "2", true, null] as const;

type TupleKeys = keyof typeof tuple;

type ExtractNumber = Extract<TupleKeys, number>; // number
type ExtractString = Extract<TupleKeys, string>; // "2" | "0" | "1" | "3" | "length" | "toString" | ...
type ExtractPush = Extract<TupleKeys, "push">; // never
type ExtractSlice = Extract<TupleKeys, "slice">; // "slice"
```

## Ограничение кортежа

`extends readonly any[]` позволяет передавать как кортежи, так и массивы.

```ts
type Length<Tuple extends readonly any[]> = Tuple["length"];

const array = [1, 2, 3];
const tuple = [1, 2, 3] as const;

type A = Length<typeof array>; // number
type B = Length<typeof tuple>; // 3
type C = Length<[1, 2]>; // 2
```

https://typehero.dev/challenge/length-of-tuple

## Расширение кортежа

Для расширения используется оператор `...`.

```ts
const array = [1, 2, 3];
const tuple = [4, 5, 6] as const;

type Concat<Array1 extends readonly any[], Array2 extends readonly any[]> = [...Array1, ...Array2];

type A = Concat<typeof array, typeof tuple>; // [...number[], 4, 5, 6]
```

Кортеж распаковался, а массив превратился в `number[]`, так как `TS` не знает ничего о его длине. 

https://typehero.dev/challenge/concat

TODO: Добавить про `[...T]` https://typehero.dev/challenge/promise-all