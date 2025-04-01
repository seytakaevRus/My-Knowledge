---
refs:
---
## Описание

```ts

```

---
## Решение 1

????

```ts
type DeepReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key] extends { [key: number]: unknown }
		? DeepReadonly<Type[Key]>
		: Type[Key];
};
```

---
## Решение 2

```ts
type DeepReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key] extends object
		? Type[Key] extends Function
			? Type[Key]
			: DeepReadonly<Type[Key]>
		: Type[Key];
};

```