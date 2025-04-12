
`Массив` в `TypeScript` может быть представлен как типом, так и значением. У массивов нет фиксированной длины и типы не привязаны к позициям.

---
## Создание массива

Создать тип массива можно при помощи `[]` или дженерика `Array`.

```ts
type StringArray = string[];
type NumberArray = Array<number>;
type BooleanOrNullArray = (boolean | null)[];

const array: BooleanOrNullArray = [true, false, null];
```

---
## `array["length"]`

`array["length"]` возвращает `number`.

```ts
const numbers = [1, null, true, "4", () => {}];

type NumbersLength = typeof numbers["length"]; // number
```

---
## `array[number]` и `array[index]`

`array[number]` вернёт объединение из типов.

```ts
type ArrayItems = typeof array[number]; // string | number | boolean | (() => void) | null
```

`array[index]` также вернёт объединение из типов.

```ts
type ArrayElement1 = typeof array[0]; // string | number | boolean | (() => void) | null
type ArrayElement2 = typeof array[8]; // string | number | boolean | (() => void) | null
```

---
## `keyof`

[[keyof]] на массив вернёт:

- `number` (в него собираются индексы);
- методы и свойства из `Array.prototype`.

```ts
const array = [1, "2", true, null];

type ArrayKeys = keyof typeof array;

type ExtractNumber = Extract<ArrayKeys, number>; // number
type ExtractZeroIndex = Extract<ArrayKeys, 0>; // never
type ExtractString = Extract<ArrayKeys, string>; // "length" | "toString" | "toLocaleString" | "pop"
type ExtractPush = Extract<ArrayKeys, "push">; // "push"
```

---
## Ограничение на приём только массивов

`extends any[]` ограничивает, чтобы передавать можно было только массивы.

```ts
type OnlyArrays<ArrayType extends any[]> = ArrayType;

type A = OnlyArrays<[1, 2, 3]>; // [1, 2, 3]
type B = OnlyArrays<null>; // null
type C = OnlyArrays<{}>; // {}
```

---
## Расширение массива

Для расширения массива используется оператор `...`.

```ts
const array = [1, 2, 3];

type Push<ArrayType extends unknown[], Element> = [...ArrayType, Element];

type A = Push<typeof array, "">; // [...number[], ""]
```

https://typehero.dev/challenge/push