---
refs:
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
		? Type[Key] extends Function
			? Type[Key]
			: DeepReadonly<Type[Key]>
		: Type[Key];
};

```