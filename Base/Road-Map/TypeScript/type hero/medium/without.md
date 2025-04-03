---
refs:
---
## Описание

```ts

```

---
## Решение 1

```ts
type Without<BaseArray extends unknown[], ItemsNeedToDelete extends unknown[] | unknown> = {
	[Key in keyof BaseArray as BaseArray[Key] extends ArrayToTuple<ItemsNeedToDelete> ? never : Key]: BaseArray[Key];
}
```

---
## Решение 2

```ts

```