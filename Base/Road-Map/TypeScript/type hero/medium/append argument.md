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

Используя [[Infer]], можно достучаться до параметров и возвращаемого типа функции, а при помощи конструкции `[...]` можно создать новый массив.

```ts
type AppendArgument<FunctionType extends (...args: any[]) => any, Argument> = FunctionType extends (
	...args: infer Arguments
) => infer ReturnType
	? (...args: [...Arguments, x: Argument]) => ReturnType
	: never;

type A = AppendArgument<(a: number, b: string) => number, boolean>; // (a: number, b: string, x: boolean) => number
type B = AppendArgument<() => void, undefined>; // (x: undefined) => void

```

---
## Решение 2

Вместо `infer` можно использовать встроенные утилиты `Parameters<FunctionType>` и `ReturnType<FunctionType>`

```ts
type AppendArgument<FunctionType extends (...args: any[]) => any, Argument> =
	(...args: [...Parameters<FunctionType>, x: Argument]) => ReturnType<FunctionType> 

```