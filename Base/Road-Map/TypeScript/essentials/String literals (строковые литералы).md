
`Строковый литерал` это более конкретный тип строки, который представлен символами, в отличие от строки, представляющейся отдельным типом `string`. `TS` не знает длину строковых литералов и не умеет их индексировать как массив символов.

---
## Создание строкового литерала

Строковый литерал создаётся явно.

```ts
type Literal = "hello"; // hello
```

Либо при помощи `const`, так как переменную в дальнейшем нельзя будет изменить.

```ts
const hello = "hello"; // hello
```

Также его можно создать при помощи `template literal` синтаксиса (`${}`), как в `JS`. ^26d17b

```ts
type Hello = "hello";
type World = "world";

type HelloWorld = `${Hello} ${World}`; // "hello world"
```

---
## `stringLiteral["length"]`

`stringLiteral["length"]` возвращает `number`.

```ts
const stringLiteral = "hello";

type StringLiteralLength = typeof stringLiteral["length"]; // number
```

https://typehero.dev/challenge/length-of-string

---
## `stringLiteral[number]`

`stringLiteral[number]` возвращает `string`.

```ts
type StringLiteralItems = typeof stringLiteral[number]; // string
```

---
## `stringLiteral[index]`

`stringLiteral[index]` также возвращает `string`.

```ts
type StringLiteralIndex = typeof stringLiteral[0]; // string
```

---
## Перебор строкового литерала

### При помощи `infer`

Нужно создать дженерик `StringToArray<Type>`, который принимает строку и возвращает её представление в виде массива.

При помощи `template literal` синтаксиса [[#^26d17b|можно создавать строки]], поэтому он подходит для использования с `infer`. Останется только хранить новый массив, как новый дженерик, подобное поведение можно встретить в задачи [[without]].

```ts
type StringToArray<Type extends string, Accumulator extends unknown[] = []> = Type extends `${infer FirstLetter}${infer Rest}`
  ? StringToArray<Rest, [...Accumulator, FirstLetter]>
  : Accumulator;

type A = StringToArray<"foo">;  // ["f", "o", "o"]
type B = StringToArray<"">;     // []
type C = StringToArray<" T  S  ">; // [" ", "T", " ", " ", "S", " ", " "]
```