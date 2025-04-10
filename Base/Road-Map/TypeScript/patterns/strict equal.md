```ts
type StrictEqual<T, U> = (<G>() => T extends G ? 1 : 0) extends (<G>() => U extends G ? 1 : 0) ? true : false;
```