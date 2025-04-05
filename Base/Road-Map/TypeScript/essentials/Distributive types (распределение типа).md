`Дистрибутивность типа` - механизм, который позволяет `TS` автоматически применять типовые операции (`conditional types` или `mapped types`) ко всем элементам в объединении типов. Это значит, что `TS` не рассматривает объединённый тип, как целое, а "раскрывает" его и применяет операцию к каждому из типов в объединении по отдельности.

### Conditional types (условные типы)

В конструкции ниже:

- Если `T` является объединением, то к каждому типу из `T` применяется `extends K ? never : T`;
- Если же `T` это один тип, то только к нему применяется `extends K ? never : T`.

```ts
type Generic<T, K> = T extends K ? never : T;
```

Тип [[Never#^3f5660|never]] будет удалён из конечного объединения, поэтому конструкция выше часто используется для удаления из объединения типов.

#### Удаление типа из объединения

Например, есть объединение и мы хотим убрать из него некоторые элементы, получив на выходе другое объединение.

```ts
type MyExclude<BaseUnion, UnionWithTypesForDelete> = BaseUnion extends UnionWithTypesForDelete ? never : BaseUnion;

type Union = number | string | null | undefined | symbol;
type TransformedUnion = MyExclude<Union, null | undefined | symbol>; // string | number
```

#### Изменение типов в объединении

Например, у нас есть объединение из примитивов, а мы хотим получить объединение из объектов, с ключом `type`, где значением будет тип из входящего объединения.

```ts
type UnionToObject<Union> = Union extends any ? { type: Union } : never;

type Union = number | string | null | undefined | symbol;
type UnionObject = UnionToObject<Union>; // { type: undefined } | { type: number } | { type: string } | { type: null } | { type: symbol } | 
```

### Mapped types (перебор типа)

В конструкции ниже:

- Если `T` является объединением, то к каждому типу из `T` применяется перебор типа;
- Если же `T` это один тип, то только к нему применяется перебор типа.

```ts
type A = { foo: string, bar: string };
type B = { bar: number, baz: boolean };

type Generic<T> = {
  [Key in keyof T]: T[Key]
}

type C = Generic<A | B>; // { foo: string, bar: string } | { bar: number, baz: boolean }
type D = C["bar"]; // string | number
```