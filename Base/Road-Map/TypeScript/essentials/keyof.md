TODO: Написать keyof с объединением

```ts
type A = { foo: string, bar: number };
type B = { bar: number, baz: boolean };

type Keys = keyof (A | B); // bar

type C = (A | B)["bar"];  // number
```