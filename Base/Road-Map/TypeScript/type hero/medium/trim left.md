---
refs:
  - https://typehero.dev/challenge/trim-left
---
## Описание

Создать дженерик `TrimLeft<Type>`, который принимает строковый литерал и возвращает его версию без пробелом в начале.

```ts
type trimed = TrimLeft<'  Hello World  '> // 'Hello World  '
```

---
## Решение 1

Используя [[String literals (строковые литералы)#При помощи `infer`| перебор при помощи infer]] и [[String literals (строковые литералы)#^e0e594|факт]], что можно передавать объединение в `template literal`, решаем задачу.

```ts
type Whitespaces = " " | "\n" | "\t";

type TrimLeft<Type extends string> = Type extends `${Whitespaces}${infer Rest}`
	? TrimLeft<Rest>
	: Type;

  type A = TrimLeft<'str'>; // "str"
  type B = TrimLeft<' str'>; // "str"
  type C = TrimLeft<'     str'>; // "str"
  type D = TrimLeft<'     str     '>; // "str     "
  type E = TrimLeft<'   \n\t foo bar '>; // "foo bar "
  type F = TrimLeft<''>; // ""
  type G = TrimLeft<' \n\t'>; // ""
```