## Что это?

`Дистрибутивность типа` - механизм, который позволяет `TS` автоматически применять типовые операции (`conditional types` или `mapped types`) ко всем элементам в объединении. Это значит, что `TS` не рассматривает объединённый тип, как целое, а "раскрывает" его и применяет операцию к каждому из типов в объединении по отдельности.

TODO: Добавить про `never`

---
## Conditional types (условные типы)

В конструкции ниже:

- Если `T` является объединением, то к каждому типу из `T` применяется `extends K ? never : T`;
- Если же `T` это один тип, то только к нему применяется `extends K ? never : T`.

```ts
type Generic<T, K> = T extends K ? never : T;
```

- [[exclude]];
- [[transform union]].

---
## Mapped types (перебор типа)

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
```

- [[readonly]].

---
## Как отключить распределение?

Любая обёртка типа, стоящего слева от `extends` отключает распределение.
### Через `[]`

В `TestArray` идёт сравнение `["a" | 5]` с `[string]`, поэтому `No`. А в `TestUnion` идёт сравнение `"a"` с `string` и `5` с `string`, поэтому ответ `No | Yes`.

```ts
type TestArray<Union> = [Union] extends [string]
  ? "Yes"
  : "No"

type A = TestArray<"a" | 5>; // No

type TestUnion<Union> = Union extends string
  ? "Yes"
  : "No"

type B = TestUnion<"a" | 5>; // No | Yes
```

### Через `{}`

В `TestObject` идёт сравнение `{ x: "a" | 5 }` с `{ x: string }`, поэтому `No`. А в `TestUnion` идёт сравнение `"a"` с `string` и `5` с `string`, поэтому ответ `No | Yes`.

```ts
type TestObject<Union> = { x: Union } extends { x: string }
  ? "Yes"
  : "No"

type A = TestObject<"a" | 5>; // No

type TestUnion<Union> = Union extends string
  ? "Yes"
  : "No"

type B = TestUnion<"a" | 5>; // No | Yes
```

### Через `() => {}`

Причём можно передавать как через возвращаемый тип, так и через параметры, единственное, что у параметры будет другое поведение.

```ts
type TestFunctionReturnType<Union> = (() => Union) extends (() => string) 
  ? "Yes"
  : "No"

type TestFunctionParameters<Union> = ((x: Union) => void) extends ((x: string) => void) 
  ? "Yes"
  : "No"

type A = TestFunctionReturnType<"a" | 5>; // No
type B = TestFunctionParameters<"a" | 5>; // No

type TestUnion<Union> = Union extends string
  ? "Yes"
  : "No"

type C = TestUnion<"a" | 5>; // No | Yes
```

TODO: Добавить про вариантность, контрвариантность и т.д. и переписать на IsNever, так будет проще