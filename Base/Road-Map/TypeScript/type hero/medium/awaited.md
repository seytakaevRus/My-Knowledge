---
refs:
  - https://typehero.dev/challenge/awaited
---
## Описание

Нужно написать аналог дженерика `Awaited<ExampleType>`.

```ts
type ExampleType = Promise<string>;

type Result = MyAwaited<ExampleType>; // string
```

---
## Решение 1

В дженерике используется `PromiseLike` вместо `Promise`, чтобы принимать объекты, у которых реализован метод `then` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables). Далее проверяем, является ли `Type` таким объектом и если да заходим в рекурсию, это нужно для снятия вложенных типов `PromiseLike`, если `Type` это не промис-подобный объект, то возвращаем его.

```ts
type MyAwaited<Type> = Type extends PromiseLike<infer AwaitedType>
	? MyAwaited<AwaitedType>
	: Type

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>
type T = { then: (onfulfilled: (arg: number) => any) => any }

type A = MyAwaited<X>; // string
type B = MyAwaited<Y>; // { field: number }
type C = MyAwaited<Z>; // string | number
type D = MyAwaited<Z1>; // string | boolean
type E = MyAwaited<T>; // number
type F = MyAwaited<"3"> // "3"
```