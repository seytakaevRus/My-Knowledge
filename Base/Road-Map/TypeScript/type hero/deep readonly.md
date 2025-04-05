---
refs:
  - https://typehero.dev/challenge/deep-readonly
---
## Описание

```ts

```

---
## Решение 1

Написать про различие `(...args: any[]) => any` и `Function`

```ts
type DeepReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key] extends object
		? Type[Key] extends (...args: any) => any
			? Type[Key]
			: DeepReadonly<Type[Key]>
		: Type[Key]
}

```