---
refs:
  - https://typehero.dev/challenge/last-of-array
---
## Описание

Написать дженерик `Last`, который принимает тип массива и возвращает его последний элемент.

```ts
type arr1 = ['a', 'b', 'c']
type arr2 = [3, 2, 1]

type tail1 = Last<arr1> // 'c'
type tail2 = Last<arr2> // 1
```
 ---
## Решение 1

При помощи [[Infer]] достаём последний элемент массива и все элементы перед ним, последний элемент и возвращаем.

```ts
type Last<Array extends unknown[]> = Array extends [...infer Rest, infer LastItem] ? LastItem : never;

type A = Last<[]>; // never
type B = Last<[2]>; // 2
type C = Last<[3, 2, 1]>; // 1
type D = Last<[() => 123]>; // () => 123
```

---
## Решение 2

Можно обойтись и без `infer`. Можно заметить, что в `Last` кидаются типы массивов и если к ним применить доступ по индексу или получение длины, то мы получим литерал, а не тип.

```ts
type MyAraay = [1, 2, 3];

type A = MyAraay[0]; // 1
type B = MyAraay["length"]; // 3
```

Если получить доступ по индексу, где индекс равняется длины массива, то можно получить индекс последнего элемента `+ 1`, значит нужно всего добавить в массив элемент в начало. Первым элементом будет `never`, чтобы при пустом массив возвращался тоже `never`.

```ts
type Last<Array extends unknown[]> = [never, ...Array][Array["length"]];
```