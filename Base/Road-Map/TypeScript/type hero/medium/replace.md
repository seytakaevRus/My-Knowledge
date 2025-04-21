## Описание

Нужно реализовать тип `Replace`, который заменяет **первое вхождение** подстроки `From` в строке `Input` на подстроку `To`.

```ts
type Replace<'types are fun!', 'fun', 'awesome'> // "types are awesome!"
type Replace<'foo bar baz', 'bar', 'qux'> // "foo qux baz"
```

---
## Решение 1

Сначала обрабатывает кейс, когда `From` это пустая строка, в таком случае возвращаем исходную строку. Затем парсим строковый литерал на то, что будет перед `From` (`Before`), сам `From` и то, что будет после `From` (`After`). [[String literals (строковые литералы)#^infer-can-be-empty|Не забываем]], что `infer` может выводить пустую строку. И остаётся только соединить `Before`, `To` и `After`.

```ts
type Replace<Input extends string, From extends string, To extends string> = From extends ''
	? Input
	: Input extends `${infer Before}${From}${infer After}`
		? `${Before}${To}${After}`
		: Input

type A = Replace<"types are fun!", "fun", "awesome">; // "types are awesome!"
type B = Replace<"foo bar baz", "bar", "qux">;         // "foo qux baz"
type C = Replace<"hello world", "world", "TS">;        // "hello TS"
type D = Replace<"nothing here", "x", "y">;            // "nothing here"
type E = Replace<"aaa", "", "b">;                      // "aaa"
```