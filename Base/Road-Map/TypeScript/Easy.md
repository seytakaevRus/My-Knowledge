


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
