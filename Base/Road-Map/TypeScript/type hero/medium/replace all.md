## Описание

Нужно реализовать тип `ReplaceAll`, который заменяет **все вхождения** подстроки `From` в строке `Input` на подстроку `To`.

```ts
type ReplaceAll<'foo bar baz', 'bar', 'qux'> // "foo qux baz"
type ReplaceAll<'foofoofoo', 'foo', 'bar'>   // "barbarbar"
```

---
## Решение 1

> Если решение требует простую рекурсию и длина символов небольшая, то лучше использовать её, чем императивный стиль.

Здесь используется тот же подход, что и в [[replace]]. Отличие в том, что мы передаём в рекурсию только ту строку, которую ещё не обработали.

```ts
type ReplaceAll<Input extends string, From extends string, To extends string> = Input extends `${infer Before}${From}${infer After}`
	? From extends ""
		?  Input
		: `${Before}${To}${ReplaceAll<After, From, To>}`
	: Input

type A = ReplaceAll<"foo bar baz", "bar", "qux">;   // "foo qux baz"
type B = ReplaceAll<"foofoofoo", "foo", "bar">;     // "barbarbar"
type C = ReplaceAll<"aaa", "a", "b">;               // "bbb"
type D = ReplaceAll<"abc", "x", "y">;               // "abc"
type E = ReplaceAll<"test", "", "x">;              // "test"
type F = ReplaceAll<"oob", "ob", "b"> // "ob"
```

Передать в `ReplaceAll` просто `${Before}${To}${After}`, как в [[replace]], не получится, так как тест `F` не пройдёт. Поэтому в `ReplaceAll` передаётся `After`, а обработанный `Before` и `To` ставятся вперёд, образую новую строку.