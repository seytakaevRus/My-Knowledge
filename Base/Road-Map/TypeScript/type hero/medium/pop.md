---
refs:
  - https://typehero.dev/challenge/pop
---
## Описание

Нужно реализовать дженерик `Pop<Array>`, который принимает тип массива и возвращает массив без последнего элемента или `[]`, если это был пустой массив.

```ts
type arr1 = ['a', 'b', 'c', 'd']
type arr2 = [3, 2, 1]

type re1 = Pop<arr1> // ['a', 'b', 'c']
type re2 = Pop<arr2> // [3, 2]
```
 ---
## Решение 1

Если массив пустой (`extends []`), то его и возвращаем, иначе достаём при помощи [[Infer]] последний элемент и все элементы перед ним и возвращаем `Rest`.

```ts
type Pop<Array extends unknown[]> = Array extends []
	? []
	: Array extends [...infer Rest, infer LastItem] 
		? Rest
		: never 

type A = Pop<[3, 2, 1]>; // [3, 2]
type B = Pop<['a', 'b', 'c', 'd']>; // ["a", "b", "c"]
type C = Pop<[]>; // []
```

---
## Решение 2

Решение можно сделать проще, если сразу достать при помощи `infer` `Rest` и `LastItem`.

```ts
type Pop<Array extends unknown[]> = Array extends [...infer Rest, infer LastItem] ? Rest : [];
```