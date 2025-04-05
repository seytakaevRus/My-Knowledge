---
refs:
  - https://typehero.dev/challenge/type-lookup
---
## Описание

Нужно написать дженерик `LookUp<Union, Type>`, в который первым параметром передаётся объединение из типов, у которых обязательно присутствует `type: string`, а вторым параметром является значение `type`.

```ts
interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
  color: 'brown' | 'white' | 'black'
}

type MyDogType = LookUp<Cat | Dog, 'dog'> // Dog
```
 ---
## Решение 1

TODO: Вставить ссылку на Extract.

Используя [[Distributive types (распределение типа)|распределение типа]]] можно перебрать типы из `Union`, а утилита `Extract` позволяет вытаскивать из типа подходящий подтип.

```ts
type LookUp<Union extends { type: string }, Type extends Union["type"]> = 
	Union extends Extract<Union, { type: Type }> ? Union : never;

type A = LookUp<Animal, "dog">; // Dog
type B = LookUp<Animal, "cat">; // Cat
type C = LookUp<Animal, "rat">; // error + never
```

---
## Решение 2

Этот дженерик можно улучшить, если заменить `Extract` на `{ type: Type }`.

```ts
type LookUp<Union extends { type: string }, Type extends Union["type"]> = 
	Union extends { type: Type } ? Union : never;
```