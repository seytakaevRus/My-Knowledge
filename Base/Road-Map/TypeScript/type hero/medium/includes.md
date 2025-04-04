---
refs:
  - https://typehero.dev/challenge/includes
---
## Описание

Нужно написать функцию `Array.includes`, но для системы типов. Она принимает два аргумента, тип массива и тип элемента. Производит [[Strict type equality (строгое равенство типов)|строгое сравнение]]. Возвращает либо `false`, либо `true`.

```ts
type isPillarMen = Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'> // false
```

---
## Решение 1

Нам нужно на основе массива вернуть `true` или `false` значит нужно использовать [[Mapped array types (перебор типа массива или кортежа)#При помощи `infer`|этот способ]].

Как работает `StrictEqual` можно посмотреть [[Strict type equality (строгое равенство типов)|здесь]].

```ts
type StrictEqual<T, U> = (<G>() => G extends T ? 1 : 0) extends (<G>() => G extends U ? 1 : 0) ? true : false;

type Includes<Array extends readonly unknown[], Item> = Array extends [infer FirstItem, ...infer Rest]
	? StrictEqual<FirstItem, Item> extends true 
		? true
		: Includes<Rest, Item>
	: false;

type A = Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Kars">; // true
type B = Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Dio">; // false
type C = Includes<[1, 2, 3, 5, 6, 7], 7>; // true
type D = Includes<[1, 2, 3, 5, 6, 7], 4>; // false
type E = Includes<[1, 2, 3], 2>; // true
type F = Includes<[1, 2, 3], 1>; // true
type G = Includes<[{}], { a: "A" }>; // false
type H = Includes<[boolean, 2, 3, 5, 6, 7], false>; // false
type I = Includes<[true, 2, 3, 5, 6, 7], boolean>; // false
type J = Includes<[false, 2, 3, 5, 6, 7], false>; // true
type K = Includes<[{ a: "A" }], { readonly a: "A" }>; // false
type L = Includes<[{ readonly a: "A" }], { a: "A" }>; // false
type M = Includes<[1], 1 | 2>; // false
type N = Includes<[1 | 2], 1>; // false
type O = Includes<[null], undefined>; // false
type P = Includes<[undefined], null>; // false
```