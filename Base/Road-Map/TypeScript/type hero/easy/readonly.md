---
refs:
  - https://typehero.dev/challenge/readonly
---
## Описание

Нужно написать аналог `Readonly<Type>`.

---
## Решение 1

Здесь нужно воспользоваться [[Mapped object types (перебор типа объект)|перебором типа]].

```ts
type MyReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key];
}

type Todo = {
	title: string;
	description: string;
}

type A = MyReadonly<Todo>; // { readonly title: string, readonly description: string }
```