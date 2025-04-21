## Описание

Нужно реализовать тип `ReplaceAll`, который заменяет **все вхождения** подстроки `From` в строке `Input` на подстроку `To`.

```ts
type ReplaceAll<'foo bar baz', 'bar', 'qux'> // "foo qux baz"
type ReplaceAll<'foofoofoo', 'foo', 'bar'>   // "barbarbar"
```

---
## Решение 1

```ts
type A = ReplaceAll<"foo bar baz", "bar", "qux">;   // "foo qux baz"
type B = ReplaceAll<"foofoofoo", "foo", "bar">;     // "barbarbar"
type C = ReplaceAll<"aaa", "a", "b">;               // "bbb"
type D = ReplaceAll<"abc", "x", "y">;               // "abc"
type E = ReplaceAll<"test", "", "x">;              // "test"


```

---
## Решение 2

```ts

```
