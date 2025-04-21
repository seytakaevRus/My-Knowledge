TODO: Если кинуть объединения в рекурсию, то TS умрёт

```ts
type Test<Union> = Union extends any ? Test<Union> : never;

type A = Test<"A" | "B">
```

Потому что `"A" extends any ? Test<"A"> : never` будкт выполняться вечно.