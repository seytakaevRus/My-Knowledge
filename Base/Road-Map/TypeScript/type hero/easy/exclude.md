---
refs:
  - https://typehero.dev/challenge/exclude
---
## Описание

Нужно реализовать аналог `Exclude`, то есть `MyExclude<BaseUnion, UnionWithTypesToDelete>`, который из `BaseUnion` удаляет все типы в `UnionWithTypesToDelete`.

```ts
type Result = MyExclude<'a' | 'b' | 'c', 'a'> // 'b' | 'c'
```

---

Используя [[Distributive types (распределение типа)#Conditional types (условные типы)|распределение условного типа]] и тот факт, что [[Never#^3f5660|never]] удаляется из объединения можно реализовать заданный дженерик.
## Решение 1

```ts
type MyExclude<BaseUnion, UnionWithTypesToDelete> = BaseUnion extends UnionWithTypesToDelete ? never : BaseUnion;

type Union = number | string | null | undefined | symbol;
type TransformedUnion = MyExclude<Union, null | undefined | symbol>; // string | number
```