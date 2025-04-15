---
refs:
  - https://typehero.dev/challenge/append-argument
---
## Описание

Нужно написать дженерик `AppendArgument<FunctionType, Argument>`, который принимает тип функции и тип аргумента. Дженерик возвращает новую функцию, в параметрах которой в конец добавляется переданный тип аргумента.

```ts
type Fn = (a: number, b: string) => number

type Result = AppendArgument<Fn, boolean> // (a: number, b: string, x: boolean) => number
```

---
## Решение 1

Используя [[Infer#В функциях|infer]], можно достучаться до параметров и возвращаемого типа функции, а при помощи конструкции `[...]` можно создать новый массив, а при помощи `x : ArgumentType` создаю новый элемент кортежа.

```ts
type AppendArgument<Type extends (...args: any[]) => any, ArgumentType> = Type extends (...args: infer Parameters) => infer ReturnType
  ? (...args: [...Parameters, x: ArgumentType]) => ReturnType
  : never

type A = AppendArgument<(a: number, b: string) => number, boolean>; // (a: number, b: string, x: boolean) => number
type B = AppendArgument<() => void, undefined>; // (x: undefined) => void

```

---
## Решение 2

Вместо `infer` можно использовать встроенные утилиты `Parameters<Type>` и `ReturnType<Type>`

```ts
type AppendArgument<Type extends (...args: any[]) => any, ArgumentType> = (...args: [...Parameters<Type>, x: ArgumentType]) => ReturnType<Type>
```