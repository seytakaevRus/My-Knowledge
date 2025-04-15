---
refs:
  - https://typehero.dev/challenge/capitalize
---
## Описание

Нужно написать аналог `Capitalize<Type>`, который конвертирует первую букву строки в верхний регистр, а остальные буквы возвращает как есть.

```ts
type Capitalized = Capitalize<'hello world'> // 'Hello world'
```

---
## Решение 1

Есть составить тип объект, где ключом будет буква в нижнем регистре, а значением букву в верхнем регистре, то можно реализовать аналог `Uppercase<Type>`, где в условии смотрим, является ли буква ключом объекта. Затем при помощи [[String literals (строковые литералы)#При помощи `infer`|infer]] достаём первый символ и делаем его заглавным.

```ts
type UpperMap = {
  a: "A";
  b: "B";
  c: "C";
  d: "D";
  e: "E";
  f: "F";
  g: "G";
  h: "H";
  i: "I";
  j: "J";
  k: "K";
  l: "L";
  m: "M";
  n: "N";
  o: "O";
  p: "P";
  q: "Q";
  r: "R";
  s: "S";
  t: "T";
  u: "U";
  v: "V";
  w: "W";
  x: "X";
  y: "Y";
  z: "Z";
};

type MyUppercase<Type extends string> = Type extends keyof UpperMap ? UpperMap[Type] : Type;

type MyCapitalize<Type extends string> = Type extends `${infer FirstLetter}${infer Rest}`
	? `${MyUppercase<FirstLetter>}${Rest}`
	: ""
```

---
## Решение 2

Решение аналогичное, но используется встроенная утилита `Uppercase`.

```ts
type MyCapitalize<Type extends string> = Type extends `${infer FirstLetter}${infer Rest}`
	? `${Uppercase<FirstLetter>}${Rest}`
	: ""
```