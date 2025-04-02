
Нужно создать дженерик `StrictEqual`, который бы возвращал `true`, если типы строго равны и `false` в противном случае. Что значит строго? Это значит что тип равен только себе, то есть `StrictEqual<true, true>` должен вернуть `true`, а `StrictEqual<true, boolean>` вернуть `false`.

Первое, что приходит в голову это использовать оператор `extends`, причём два раза, скажем, есть тип `T` и `U`, то сначала делаем `T extends U`, а затем `U extends T` и проверяем их возвращаемый результат. Для удобства будет использовать `1` и `0`, потому что это всего один символ, хотя можно использовать и привычные `true` с `false`.

```ts
type StrictEqual<T, U> = (T extends U ? 1 : 0) extends (U extends T ? 1 : 0)
  ? true
  : false;
```

Но если проверить результат, то окажется, что `StrictEqual` не так, как ожидалось.

```ts
type Test = StrictEqual<true, boolean>; // true
```

Но почему, ведь код ниже работает корректно.

```ts
type A = true extends boolean ? 1 : 0; // 1
type B = boolean extends true ? 1 : 0; // 0
type C = A extends B ? true : false; // false
```

Рассмотрим подробно как выполняется `StrictEqual<true, boolean>`:

1. Сначала `TS` видит `(T extends U ? 1 : 0)`, которое превращается в `true extends boolean ? 1 : 0` и возвращается `1`;
2. Затем `TS` видит `(U extends T ? 1 : 0)` и раз `U` это `boolean`, которое является по сути объединением из `true` и `false`, то `TS` [[Conditional types (условные типы)#Distributive conditional types (распределительные условных типов)|разворачивает]] условие на следующие два `(true extends true ? 1 : 0)` и `(false extends true ? 1 : 0)`, раз первое возвращает `1`, а второе `0`, то возвращается `1 | 0`.
3. В конечном итоге имеем следующие выражение `1 extends 1 | 0 ? true : false`, что справедливо возвращает `true`;

Проверить второй пункт можно также при помощи дженерика `HalfSimpleEqual`.

```ts
type HalfSimpleEqual<T, U> = U extends T ? 1 : 0;

type A = HalfSimpleEqual<true, boolean>; // 1 | 0
```

В таком случае могут помочь функции, потому что они не поддерживают распределение.

```ts
type F1<T> = <G>() => G extends T ? 1 : 0;
type F2<U> = <G>() => G extends U ? 1 : 0;

type StrictEqual<T, U> = F1<T> extends F2<U> ? true : false;

type A = StrictEqual<true, boolean>; // false
type B = StrictEqual<boolean, true>; // false
```

Здесь `G` является дженериком внутри анонимной функции, которая никогда не будет вызвана, поэтому этот дженерик так и останется абстрактным и в него никак нельзя передать значение. В его использовании только один смысл, дать возможность `TS` проверять всю сигнатуру функции.

```ts
Вызов StrictEqual<true, boolean> даст два вызова

F1<true>, который превратится в <G>() => G extends true ? 1 : 0
и F2<boolean>, который превратится в <G>() => G extends boolean ? 1 : 0

TS сравнит сравнит <G>() => G extends true ? 1 : 0 и <G>() => G extends boolean ? 1 : 0, и выдаст, что они не одинаковые
```
