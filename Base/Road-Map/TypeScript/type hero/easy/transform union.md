## Описание

Нужно написать дженерик `TransformUnion<Union>`, который принимает объединение и возвращает другое объединение, у которого каждый элемент это объект, который имеет в качестве ключа `type`, а в качестве значения элемент из объединения. 

```ts
type Union = number | string | null | undefined | symbol;
type TransformedUnion = TransformUnion<Union>; // { type: undefined } | { type: number } | { type: string } | { type: null } | { type: symbol } | 
```

---
## Решение 1

Нам нужна диструбитивность типа, один из вариантов её достижение это [[Distributive types (распределение типа)#Conditional types (условные типы)|условный тип]]. Любой тип, проходя через проверку `extends any` будет возвращать первую ветку.

```ts
type TransformUnion<Union> = Union extends any ? { type: Union }: never;
```

---
## Решение 2

Можно создать объект с ключами и значениями вида `{ type: element }`, а затем достать от туда значения при помощи [[Indexed types (получение типа по ключу)|индексирования по типу]].

```ts
type TransformUnion<Union extends PropertyKey> = {
  [Key in Union]: { type: Key };
}[Union];
```