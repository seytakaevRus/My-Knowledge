
Благодаря ключевому слову `extends` можно в зависимости от условия возвращать один из двух типов.

```ts
type Conditional<T, U> = T extends U ? true : false; 
```

Если тип `T` является подтипом типа `U`, то вернётся `true`, иначе вернётся `false`.  Когда тип является подтипом другого?

## Если `T` и `U` это пользовательские типы

Если тип `T` содержит все свойства типа `U`, то `T` является подтипом `U`.

```ts
type A = { name: string };
type B = { name: string; age: number };
type C = { name: number }

type D = B extends A ? true : false; // true
type E = A extends B ? true : false; // false

type F = C extends A ? true : false; // false
type G = A extends C ? true : false; // false
```

Выше тип `B` содержит все свойства `A` (`name` есть в обоих типах), поэтому `B` является подтипом типа `A`, поэтому `D` содержит в себе `true`. Но `A` не содержит в себе всех свойств `B` (в `A` нет `age`), поэтому `E` содержит в себе `false`.

`C` не является подтипом `A`, также как и `A` не является подтипом `C`, поэтому тип `F`, как и `G` содержит в себе `false`.

## Если `T` и `U` это встроенные типы

Если `T` менее общий, а `U` более общий тип, то `T` является подтипом `U` или по-другому, если `T` содержится в типе `U`, то `T` это подтип `U`.

```ts
type A = number extends any ? true : false; // true
type B = any extends number ? true : false; // boolean

type C = number extends string ? true : false; // false

type D = [] extends any[] ? true : false; // true
type E = any[] extends [] ? true : false; // false

type F = {} extends Record<string, string> ? true : false; // true
```

В `any` содержится `number`, поэтому `A` содержит `true`. `any` может принимать разные типы, если `any` это `number`, то `B` вернёт `true`, а если же `any` это строка, то вернёт `false`, поэтому `B` содержит `boolean`.

Пустой массив `[]` содержится в `any[]`, поэтому `D` это `true`, но не наоборот.

Пустой объект содержится в `Record<string, string>`, поэтому `F` это `true`.

Если тип слева от `extends` может быть назначен типу справа, то получится тип после `?`, если же тип не может быть назначен, то получится тип после `:`.

Также это работает и с [[Basic#Union (объединение)|объединениями]].

```ts
type A = "hello" extends string ? true : false; // true

type B = "yes" | "no" extends "yes" | "no" | "maybe" ? true : false; // true
```

Тип `string` это по сути объединение из бесконечного количество строк, поэтому в них содержится строка `hello` и `A` вернёт `true`.

Юнион `yes | no | maybe` включает в себя юнион `yes | no`, поэтому `B` вернёт `true`.

## Применение условных типов

Например, мы создаём тип `First`, который принимает дженерик, являющегося массивом, и возвращает его первый элемент, либо `never`, если был передан не массив.

```ts
type First<T extends unknown[]> = T extends [] ? never : T[0];
```

В данном случаем `[]` обозначает пустой массив и мы проверяем, может ли пустой массив содержать в себе `T` (а такое возможно только, если `T` и есть пустой массив), если да, то в `T` нет элементов, так как он пуст, поэтому возвращаем `never`, иначе возвращаем `T[0]` ([[Basic#Indexed types (получение типа по ключу)|освежить]]).

https://typehero.dev/challenge/first-of-array
https://typehero.dev/challenge/if

## Distributive conditional types (распределительные условных типов)

Если нужно изменить элементы объединения или отфильтровать объединение, то тут нужно использовать сочетание условного типа и [[Basic#Generic (общий тип)|дженериков]].

Общий синтаксис:

```ts
type Generic<T, K> = T extends K ? never : T;
```

Как это работает?

1. `T` находится слева от `extends`, поэтому если `T` это объединение, то для каждого типа `type` из `T` будет выполняться условие `type extends K ? never : type`, при возвращении `never` тип `type` не попадёт в конечное объединение;
2. Если `T` это тип, а не объединение, то просто выполнится `type extends K ? never : type` и также при возвращении `never` `type` не попадёт в конечное объединение.

Например, у нас есть объединение из примитивов, а мы хотим получить объединение из объектов, с ключом `type`, где значением будет тип из входящего объединения.

```ts
type UnionToObject<Union> = Union extends any ? { type: Union } : never;

type Union = number | string | null | undefined | symbol;
type UnionObject = UnionToObject<Union>; // { type: undefined } | { type: number } | { type: string } | { type: null } | { type: symbol } | 
```

Или есть объединение и мы хотим убрать из него некоторые элементы, получив на выходе другое объединение.

```ts
type MyExclude<BaseUnion, UnionWithTypesForDelete> = BaseUnion extends UnionWithTypesForDelete ? never : BaseUnion;

type Union = number | string | null | undefined | symbol;
type TransformedUnion = MyExclude<Union, null | undefined | symbol>;
```
