---
refs:
  - https://typehero.dev/challenge/drop-char
---
## Описание

Удаляет все символы `Character` из строки `Input`. Нужно вернуть новую строку без указанных символов.

```ts
DropChar<'abc', 'b'> // "ac"
DropChar<'a b c', ' '> // "abc"
``` 

---
## Решение 1

Используя [[String literals (строковые литералы)#При помощи `infer`|перебор при помощи infer]], проходимся по каждому символу и добавляем его в `Output` или нет.

```ts
type DropChar<Input extends string, CharToDrop extends string, Output extends string = ""> = Input extends `${infer First}${infer Rest}`
	? CharToDrop extends First
		? DropChar<Rest, CharToDrop, Output>
		: DropChar<Rest, CharToDrop, `${Output}${First}`>
	: Output;

type A = DropChar<"hello", "o">;        // "hell"
type B = DropChar<"typehero", "e">;     // "typhro"
type C = DropChar<"a b c", " ">;        // "abc"
type D = DropChar<"---TS---", "-">;     // "TS"
type E = DropChar<"clean", "z">;        // "clean"
type F = DropChar<"_a_b_c_", "_">;      // "abc"
```

---
## Решение 2

Помня, что [[String literals (строковые литералы)#^infer-can-be-empty|infer может выводить пустоту]], можно красиво удалять это через рекурсию.

```ts
type DropChar<Input extends string, CharToDrop extends string> = CharToDrop extends ""
	? Input
	: Input extends`${infer Before}${CharToDrop}${infer After}`
		? DropChar<`${Before}${After}`, CharToDrop>
		: Input
```