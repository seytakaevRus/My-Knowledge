---
refs:
  - https://typehero.dev/challenge/first-of-array
---
## Описание

Нужно реализовать дженерик `First<ArrayType>`, который принимает тип массива и возвращает первый элемент этого массива или `never`, если массив пуст.

```ts
type Arr1 = ['a', 'b', 'c']
type Arr2 = [3, 2, 1]

type Head1 = First<Arr1> // 'a'
type Head2 = First<Arr2> // 3
```

---
## Решение 1

Используя [[Conditional types (условные типы)|условный тип]], можно проверить является ли массив пустым и в таком случае вернуть `never`, иначе вернуть первый элемент массива при помощи [[Indexed types (получение типа по ключу)|получение типа по ключу]].

```ts
type First<ArrayType extends any[]> = ArrayType extends [] ? never : ArrayType[0];

type A = First<[1, 2, 3]>;
type B = First<[]>;
```