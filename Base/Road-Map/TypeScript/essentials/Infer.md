
Ключевое слово `infer` используется только с [[Conditional types (условные типы)|условными типами]] и позволяет выводить тип типа из другого типа.

Если в обычных условных типах мы используем конструкцию ниже.

```ts
T extends U ? X : Y
```

То с `infer` она приобретает следующий вид, где `R` это выведенный тип из `U`, о конкретных способах вывода будет ниже.

```ts
T extends infer R ? ... : ...
```

### Вывод возвращаемого типа функции

Нужно написать аналог `ReturnType`.

```ts
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any[]) => infer R ? R : any;

const getNumber = (a: number, b: number) => a + b;
const getArray = () => [1, "2", true];
const getNull = (a: null, b: undefined) => a;

type A = MyReturnType<typeof getNumber>; // number
type B = MyReturnType<typeof getArray>; // (string | number | boolean)[]
type C = MyReturnType<typeof getNull>; // null
type D = MyReturnType<1>; // error + any
```

Ограничиваем `T`, чтобы можно было передавать только функцию. Далее проверяем является ли `T` функцией и при помощи `infer R` в `R` будет положен тип, который возвращает функция, передаваемая в `T`.

### Вывод параметров функции

Нужно написать аналог `Parameters`.

```ts
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer A) => any ? A : any

const foo = (arg1: string, arg2: number) => arg1;
const bar = (arg1: boolean, arg2: { a: 'A' }) => {};
const baz = () => [];

type A = MyParameters<typeof foo>; // [arg1: string, arg2: number]
type B = MyParameters<typeof bar>; // [arg1: boolean, arg2: { a: "A" }]
type C = MyParameters<typeof baz>; // []
type D = MyParameters<1>; // error + any
```

Ограничиваем `T`, чтобы можно было передавать только функцию. Далее проверяем является ли `T` функцией и при помощи `infer A` в `A` будет положен тип передаваемых параметров функции, которая положена в `T`.

### Вывод только первого параметра функции

Написать дженерик `FirstParameter`, который будет выводить первый параметр функции.

```ts
type FirstParameter<T extends (...args: any) => any> = T extends (first: infer A, ...args: any) => any ? A : any;

const foo = (arg1: string, arg2: number) => arg1;
const bar = (arg1: boolean, arg2: { a: 'A' }) => {};
const baz = () => [];

type A = FirstParameter<typeof foo>; // string
type B = FirstParameter<typeof bar>; // boolean
type C = FirstParameter<typeof baz>; // unknown
type D = FirstParameter<1>; // error + any
```

Всё как и в прошлом примере, только сначала выводим параметр при помощи `infer A`, а остальные параметры собираем в `...args`.
### Вывод типа элемента из массива

Нужно написать дженерик, куда передаётся тип массива, а возвращается юнион из типов элемента массива.

```ts
type ElementType<T extends any[]> = T extends (infer E)[] ? E : any;

const a = [1, 2, 3];
const b = [null, undefined, "aa", true, false, () => {}];

type A = ElementType<typeof a>; // number
type B = ElementType<typeof b>; // string | boolean | (() => void) | null | undefined
type C = ElementType<1>; // error + any
```

Ограничиваем `T`, чтобы можно было передать только массив. Далее проверяем является ли `T` массивом и при помощи `(infer E)[]` в `E` будет положен юнион из типов элемента массива, переданного в `T`. Если сделать просто `infer R` без `[]`, то `ElementType` будет возвращать тип массива.

### Вывод типа из промиса

Нужно написать аналог `Awaited`.

```ts
type MyAwaited<T> = T extends PromiseLike<infer R> ? MyAwaited<R> : T;

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>
type T = { then: (onfulfilled: (arg: number) => any) => any }

type A = MyAwaited<X>; // string
type B = MyAwaited<Y>; // { field: number }
type C = MyAwaited<Z>; // string | number
type D = MyAwaited<Z1>; // string | boolean
type E = MyAwaited<T>; // number
type F = MyAwaited<"3"> // "3"
```

В дженерике используется `PromiseLike` вместо `Promise`, чтобы принимать объекты, у которых реализован метод `then` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables). Далее проверяем, является ли `T` таким объектом и если да заходим в рекурсию, это нужно для снятия вложенных типов `Promise`, если `T` это не промис-подобный объект, то возвращаем его.

### Вывод последнего элемента из массива

Написать дженерик `Last`, который принимает тип массива и возвращает его последний элемент.

```ts
type Last<T extends any[]> = T extends [...infer Rest, infer LastItem] ? LastItem : never;
```

Ограничиваем `T`, чтобы можно было передать только массив. Далее проверяем является ли `T` массивом и при помощи `[...infer Rest, infer LastItem]` в `Rest` будет положен юнион из типов всех элементов, кроме последнего, а в `LastItem` как раз последний элемент.

Интересно, что можно сделать и без использования `infer`.

```ts
type Last<T extends any[]> = [never, ...T][T['length']];
```

Т

https://typehero.dev/challenge/last-of-array