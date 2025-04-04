---
refs:
  - https://typehero.dev/challenge/without
---
## Описание

Нужно написать дженерик `Without<BaseArray, ItemsToDelete>`, который принимает тип массива `BaseArray` и, либо тип, либо объединение `ItemsToDelete` и возвращает тип массива без элементов из `ItemsToDelete`. 

```ts
type Res = Without<[1, 2], 1>; // [2]
type Res1 = Without<[1, 2, 4, 1, 5], [1, 2]>; // [4, 5]
type Res2 = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // []
```

---
## Решение 1



```ts
type Without<BaseArray extends unknown[], ItemsToDelete extends unknown[] | unknown> = {
	[Key in keyof BaseArray as BaseArray[Key] extends ArrayToTuple<ItemsToDelete> ? never : Key]: BaseArray[Key];
}
```

```ts
type ArrayToUnion<ArrayType extends unknown | unknown[]> = ArrayType extends unknown[] ? ArrayType[number] : ArrayType; 

type Without<BaseArray extends unknown[], ItemsToDelete extends unknown | unknown[], Accumulator extends unknown[] = []> =
	BaseArray extends [infer FirstItem, ...infer Rest]
		? FirstItem extends ArrayToUnion<ItemsToDelete>
			? Without<Rest, ItemsToDelete, Accumulator>
			: Without<Rest, ItemsToDelete, [...Accumulator, FirstItem]>
		: Accumulator
```