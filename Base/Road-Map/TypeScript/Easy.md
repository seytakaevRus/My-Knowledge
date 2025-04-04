
## Arrays (массивы)

Для создания типа массива достаточно использовать `[]` или дженерик `Array`.

```ts
type StringArray = string[];
type NumberArray = Array<number>;
type BooleanOrNullArray = (boolean | null)[];

const array: BooleanOrNullArray = [true, false, null];
```

Если применить оператор [[Basic#Оператор `typeof`|typeof]] к массиву, то можно получить объединение из типов элементов с `[]`

```ts
const numbers = [1, null, true, "4", () => {}];

type NumbersType = typeof numbers; // (string | number | boolean | (() => void) | null)[]
```

> Массивы изменяемые, поэтому `TS` не может дать гарантирую насчёт длины и элементов в массиве.

Если использовать `array["length"]`, то получим только тип `number`.

```ts
const numbers = [1, null, true, "4", () => {}];

type NumbersLength = (typeof numbers)["length"]; // number
```

Если использовать `array[number]`, или `array[0]` (или любой другой индекс), то получим тоже самое, что при `typeof array`, только без `[]`.

```ts
const numbers = [1, null, true, "4", () => {}];

// string | number | boolean | (() => void) | null
type NumbersElements1 = (typeof numbers)[number];
type NumbersElements2 = (typeof numbers)[0];
```

Также можно обращаться по индексу. Так как массив динамический, то вернётся объединение из элементов в массиве.

Если нужно расширить массив, то можно использовать оператор `...`, например, дженерик `Push` принимает массив и элемент, и при помощи `...` создаёт новый массив, ограничение `extends unknown[]` нужно для того, чтобы указать, что передать можно только массив.

```ts
type Push<T extends unknown[], U> = [...T, U];
```

Если применить оператор [[Basic#Оператор `keyof`|keyof]] на массив, то можно получить объединение из `number` и методов со свойствами из `Array.prototype`, это можно проверить кодом ниже.

```ts
const array = ["1", true, null, undefined];

type ArrayKeys = keyof typeof array;

type IsContainNumber = number extends ArrayKeys ? true : false; // true
type IsContainPush = "push" extends ArrayKeys ? true : false; // true
type IsContainLength = "length" extends ArrayKeys ? true : false; // true
```

Можно также использовать утилиту `Extract`, которая работает следующим образом:

1. Если `T` это не объединение, то выполняется `T extends U` и в случае успеха возвращается `T`, иначе возвращается `never`.

```ts
type A = Extract<"string", "string" | number>; // "string"
type B = Extract<boolean, "string" | number>; // never
```

2. Если `T` это объединение, то каждый тип `D` из объединения `T` прогоняется через `D extends U` и в случае успеха `D` запоминается и затем построится новое объединение, иначе возвращается `never`.

```ts
type ExtractNumber = Extract<ArrayKeys, number>; // number
type ExtactPush = Extract<ArrayKeys, "push">; // "push"
type ExtactLength = Extract<ArrayKeys, "length">; // "length"
```

Если в `tsconfig.json` в `lib` добавить `ES2022`, то код ниже тоже даст `true`.

```ts
type ExtractAt = Extract<ArrayKeys, "at">; // "at"
```

> Редко когда применяется `keyof` на массивы.

https://typehero.dev/challenge/push

## Преобразование массива/кортежа в объект

Раз нужно преобразовать в объект, то тут подойдёт [[Mapped object types (перебор типа объект)|перебор типа]]. С тем отличием, что `Key in keyof T` даст индексы и методы массива/кортежа, а нам нужно получить доступ к элементам массива, поэтому используем `Key in T[number]`. Ограничение `readonly any[]` позволяет прокидывать внутрь массивы и кортежи.

```ts
type TupleToObject<T extends readonly any[]> = {
  [Key in T[number]]: Key;
};

const a = [1, 2, 3] as const;
const b = ["true", Symbol(1), "6"] as const;

type A = TupleToObject<typeof a>; // { 1: 1, 2: 2, 3: 3 }
type B = TupleToObject<typeof b>; // { [x: symbol]: symbol, true: "true", 6: "6",  }
```

Как мы помним в `JS` ключами объекта могут быть только `string` или `symbol`, всё остальное просто преобразуется в `string`. В `TS` добавляется, что `number` также может быть ключом, так как есть обращение к массиву по индексу. Поэтому, если в `TypluToObject` закинуть не `string`, `number` или `symbol`, то `TS` будет это игнорировать.

```ts
const c = [
  () => {},
  { a: "a" },
  true,
  false,
  null,
  undefined,
  BigInt(1),
] as const;

type C = TupleToObject<typeof c>; // {}
```

Поэтому лучше ограничить передаваемый массив/кортеж на вход. Для этого есть `PropertyKey`, который является объединением из `number | string | symbol`.

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [Key in T[number]]: Key;
};
```

Теперь этот код будет выдавать ошибку.

```ts
const c = [
  () => {},
  { a: "a" },
  true,
  false,
  null,
  undefined,
  BigInt(1),
] as const;

type C = TupleToObject<typeof c>;
```

https://typehero.dev/challenge/tuple-to-object

## Типы, которые могут распадаться на более простые

Как было показано в [[Easy#Includes|Includes]] есть типы, которые распадаются на более простые, если использовать дженерики и условные типы.

### boolean

Тип `boolean` распадается на `true` и `false`.

```ts
type DistributiveBoolean<T extends boolean> = T extends true ? "yes" : "no";

type A = DistributiveBoolean<boolean>; // "yes" | "no"
```

### Пользовательское объединение

Всё, что является объединением также распадается на более простые типы.

```ts
type DistributiveCustomUnion<T> = T extends "a" ? "yes" : "no";

type B = DistributiveCustomUnion<"a" | "b">; // "yes" | "no"
```

### any

Так как `any` может быть чем угодно, то и распадается оно на что угодно.

```ts
type DistributiveAny<T extends any> = T extends "" ? "yes" : "no";

type C = DistributiveAny<any>; // "yes" | "no"
```

### Что насчёт `number` и `string`

Типы `number` и `string` являются отдельными типами, которые представляют из себя бесконечное множество литералов чисел и строк соответственно. И в отличие от `any`, который буквально обозначает "любой тип", `number` и `string` не распадаются на литералы. Это дизайнерское решение разработчиков `TS`.

```ts
type NonDistributiveNumber<T extends number> = T extends 1 ? "yes" : "no";

type A = NonDistributiveNumber<1 | 2>; // "yes" | "no"
type B = NonDistributiveNumber<number>; // "no"
```

```ts
type NonDistributiveString<T extends string> = T extends "1" ? "yes" : "no";

type C = NonDistributiveString<"1" | "2">; // "yes" | "no"
type D = NonDistributiveString<string>; // "no"
```
