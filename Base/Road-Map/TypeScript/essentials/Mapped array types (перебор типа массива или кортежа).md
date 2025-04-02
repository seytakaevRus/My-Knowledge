> Перечисленное ниже относится к кортежу тоже, для краткости будут упоминаться только массивы.

Тип массива можно перебирать по-разному, в зависимости от цели.

## При помощи `T[number]`

`T[number]`, применённый к массиву возвращает объединение, которое можно перебрать при помощи [[Conditional types (условные типы)#Distributive conditional types (распределительные условных типов)|распределение типа]].

```ts
type Iterate<ArrayType extends number> = ArrayType extends 1 ? ArrayType : never;

type A = Iterate<[1, 2, 3, 4, 5][number]>; // 1
type B = Iterate<[][number]>; // never
```

При использования `распределения типа` типы внутри массива могут [[Easy#Типы, которые могут распадаться на более простые|распадаться]] на более простые. `boolean` это объединение из `true | false`, поэтому код ниже возвращает `true`, поэтому такое поведение не подойдёт, например, в [[includes]].

```ts
type Iterate<ArrayType extends boolean> = ArrayType extends true ? ArrayType : never;

type C = Iterate<[boolean][number]>; // true
```

## При помощи `infer`

Мощный способ, который убирает недостаток предыдущего способа. К примеру, можно преобразовать тип массива в объединение без использования `T[number]`.

```ts
type ArrayToUnion<ArrayType extends unknown[]> = ArrayType extends [infer FirstItem, ...infer Rest]
    ? FirstItem | ArrayToUnion<Rest>
    : never;

type A = ArrayToUnion<[1, 2, 3, 4]>; // 1 | 2 | 3 | 4
type B = ArrayToUnion<[]>; // never
type C = ArrayToUnion<[1, "d", {}, null]>; // {} | 1 | "d" | null
```

Также при помощи этого способа легко получать и удалять первый/последний элемент в массиве.

```ts
type Pop<ArrayType extends unknown> = ArrayType extends [...infer Rest, infer LastItem] ? Rest : never;

type A = Pop<[1, 2, 3, 4]>; // [1, 2, 3]
type B = Pop<[]>; // never
type C = Pop<[1, "d", {}, null]>; // [1, "d", {}]

type Shift<ArrayType extends unknown> = ArrayType extends [infer FirstItem, ...infer Rest] ? Rest : never;

type D = Shift<[1, 2, 3, 4]>; // [2, 3, 4]
type E = Shift<[]>; // never
type F = Shift<[1, "d", {}, null]>; // ["d", {}, null]
```

## При помощи `mapped object types`

Этот вариант перебора используется тогда же, когда и [[Mapped object types (перебор типа объект)|перебор объекта]], то есть для удаления или изменения элементов.

К примеру, ниже дженерик ниже, заменяет `1` на `one`.

```ts
type MappedIterate<ArrayType extends unknown[]> = {
    [Key in keyof ArrayType]: ArrayType[Key] extends 1 ? "one" : ArrayType[Key];
}

type A = MappedIterate<[1, 2, 3, 4]> // ["one", 2, 3, 4]
```