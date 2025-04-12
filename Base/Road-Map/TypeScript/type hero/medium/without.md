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

Нам нужно вернуть новый массив, значит нужно использовать [[Tuples (кортежи)#При помощи `infer`|этот способ]].

Идея заключается в создания нового типа массива. Это возможно, если добавить новый дженерик принцип похож на добавление параметра при использовании [[Рекурсия#Реверсирование строки|рекурсии]]. 

Сначала распаковываем массив и смотрим содержится ли `FirstItem` в элементах, которые из массива `BaseArray` следует удалить. Дженерик `ArrayToUnion` возвращает либо объединение, либо тип, так как вторым аргументов в `Without` могут кинуть тип массива или тип элемента. Если `FirstItem` содержится в объединении, то мы не трогаем `Accumulator` (массив, в котором будут содержаться элементы ненужные для удаления), если же `FirstItem` не содержится, то добавляем его в конец `Accumulator`.

```ts
type ArrayToUnion<ArrayType extends unknown | unknown[]> = ArrayType extends unknown[] ? ArrayType[number] : ArrayType; 

type Without<BaseArray extends unknown[], ItemsNeedToDelete extends unknown | unknown[], Accumulator extends unknown[] = []> =
	BaseArray extends [infer FirstItem, ...infer Rest]
		? FirstItem extends ArrayToUnion<ItemsNeedToDelete>
			? Without<Rest, ItemsNeedToDelete, Accumulator>
			: Without<Rest, ItemsNeedToDelete, [...Accumulator, FirstItem]>
		: Accumulator;

type A = Without<[1, 2], 1>; // [2]
type B = Without<[1, 2, 4, 1, 5], [1, 2]>; // [4, 5]
type C = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // []
```

Благодаря использованию `extends ArrayToUnion<ItemsNeedToDelete>` производится нестрогое сравнение, если нужно строгое, то можно использовать код ниже.

Для строго сравнения используется `StrictEqual` и `Includes` из [[includes]]. `Includes` на вход требует массив, поэтому нужно `ItemsNeedToDelete` преобразовать в массив это делает дженерик `TransformToArray`. Внутри `TransformToArray` используется конструкция `[ArrayType] extends [unknown[]]`, чтобы если в `ArrayType` передался `boolean`, то тот не [[Conditional types (условные типы)#Distributive conditional types (распределительные условных типов)|расспался]] на `true | false`, потому что тогда получится `[true] | [false]` вместо `[boolean]`.

```ts
type TransformToArray<ArrayType extends unknown | unknown[]> = 
  [ArrayType] extends [unknown[]] ? ArrayType : [ArrayType];

type StrictEqual<T, U> = (<G>() => G extends T ? 1 : 0) extends (<G>() => G extends U ? 1 : 0) ? true : false;

type Includes<Type, ArrayType> = ArrayType extends [infer FirstItem, ...infer Rest]
	? StrictEqual<Type, FirstItem> extends true
		? true
		: Includes<Type, Rest>
	: false

type Without<BaseArray extends unknown[], ItemsNeedToDelete extends unknown | unknown[], Accumulator extends unknown[] = []> =
	BaseArray extends [infer FirstItem, ...infer Rest]
		? Includes<FirstItem, TransformToArray<ItemsNeedToDelete>> extends true
			? Without<Rest, ItemsNeedToDelete, Accumulator>
			: Without<Rest, ItemsNeedToDelete, [...Accumulator, FirstItem]>
		: Accumulator;

type A = Without<[1, 2], 1>; // [2]
type B = Without<[1, 2, 4, 1, 5], [1, 2]>; // [4, 5]
type C = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // []

type D = Without<[boolean, true], boolean>; // [true]
type E = Without<[boolean, null, number], [boolean, 1, 3]> // [null, number]
```