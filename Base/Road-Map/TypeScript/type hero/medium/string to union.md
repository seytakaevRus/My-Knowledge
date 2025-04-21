## Описание

Нужно реализовать тип `StringToUnion`, который превращает строку `S` в объединение всех её символов.

```ts
type StringToUnion<'abc'> // 'a' | 'b' | 'c'
type StringToUnion<'hello'> // 'h' | 'e' | 'l' | 'o'
```

---
## Решение 1

```ts
type StringToArray<Input extends string, Output extends unknown[] = []> = Input extends `${infer FirstLetter}${infer Rest}`
	? StringToArray<Rest, [...Output, FirstLetter]>
	: Output

type StringToUnion<Input extends string> = StringToArray<Input>[number];

type A = StringToUnion<"abc">;    // "a" | "b" | "c"
type B = StringToUnion<"hello">;  // "h" | "e" | "l" | "o"
type C = StringToUnion<"a">;      // "a"
type D = StringToUnion<"">;       // never
```

---
## Решение 2

```ts
type StringToUnion<Input extends string> = Input extends `${infer FirstLetter}${infer Rest}`
	? FirstLetter | StringToUnion<Rest>
	: never
```
