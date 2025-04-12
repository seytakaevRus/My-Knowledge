
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
## `array[number]`

`array[number]` вернёт объединение из типов.

```ts
type ArrayItems = typeof array[number]; // string | number | boolean | (() => void) | null
```

---
## `array[index]`

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

---
## Перебор массива

### При помощи `mapped types`

В отличие от [[Mapped object types (перебор типа объект)|перебор объекта]], с помощью которого можно чтобы удалять или изменять элементы, этот способ может только изменять элементы. 

Чтобы `mapped types` возвращал массив `K` должен быть индексом массива.

```ts
{ [K in keyof T]: ... }
```

Запись с использованием `as` и применением `never` может сохранять в `Key` индекс массива, а в `ArrayType[Key]` элемент массива, но разрушает структуру массива из-за удаления индекса, поэтому на выходе мы получаем объект.

```ts
type MappedIterate<ArrayType extends unknown[]> = {
  [Key in keyof ArrayType as ArrayType[Key] extends 1 ? never : Key]: ArrayType[Key];
}

type A = MappedIterate<[1, 2, 3, 4]> // { [x: number]: 2 | 1 | 4 | 3; length: 4;  toString: () => string; }
```

Поэтому этот метод подойдёт только для изменение элементов массива всех или только некоторых с сохранением длины массива (аналог `Array.prototype.map`).

К примеру, ниже дженерик ниже, заменяет числа на строки.

```ts
type MappedIterate<ArrayType extends unknown[]> = {
    [Key in keyof ArrayType]: ArrayType[Key] extends number ? `${ArrayType[Key]}` : never
}

type A = MappedIterate<[1, 2, 3, 4]> // ["1", "2", "3", "4"]
```

Из более полезного, где `mapped types` подойдёт для массивов - [[Tuples (кортежи)#Особенности при работе с функциями|реализация Promise.all]].