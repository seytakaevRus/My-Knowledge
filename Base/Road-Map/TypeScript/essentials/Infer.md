
Ключевое слово `infer` используется только с [[Conditional types (условные типы)|условными типами]] и позволяет выводить тип типа из другого типа.

Если в обычных условных типах мы используем конструкцию ниже.

```ts
T extends U ? X : Y
```

То с `infer` она приобретает следующий вид, где `R` это выведенный тип из `U`, о конкретных способах вывода будет ниже.

```ts
T extends infer R ? ... : ...
```

---
## В массивах

### Вывод типа элемента

```ts
type ElementType<Type extends any[]> = Type extends (infer Element)[] ? Element : any;

const a = [1, 2, 3];
const b = [null, undefined, "aa", true, false, () => {}];

type A = ElementType<typeof a>; // number
type B = ElementType<typeof b>; // string | boolean | (() => void) | null | undefined
type C = ElementType<1>; // error + any
```

Для лучшей читаемости вместо `(infer Element)[]` можно использовать `Array<infer Element>`

```ts
type ElementType<Type extends any[]> = Type extends Array<infer Element> ? Element : any;
```
### Вывод типа элемента из вложенного массива

```ts
type DeepUnwrapArray<Type extends any[]> = Type extends Array<infer ElementType>
  ? ElementType extends any[]
    ? DeepUnwrapArray<ElementType>
    : ElementType
  : Type

type A = DeepUnwrapArray<number[][][]>; // number
type B = DeepUnwrapArray<string[]>; // string
type C = DeepUnwrapArray<[]>; // never
type D = DeepUnwrapArray<number> // error + number
```

---
## В кортежах

[[Tuples (кортежи)#При помощи `infer`|Infer]]
### Вывод последнего элемента

```ts
type Last<Type extends any[]> = Type extends [...infer Rest, infer LastItem] ? LastItem : never; 

type A = Last<[1, 2, 3]>;        // 3
type B = Last<["x"]>;            // "x"
type C = Last<[]>;               // never
type D = Last<[true, false]>;    // false
```
### Вывод кортежа без последнего элемента

```ts
type Pop<Type extends any[]> = Type extends [...infer Rest, infer LastItem] ? Rest : never;

type A = Pop<[1, 2, 3]>;           // [1, 2]
type B = Pop<[true]>;             // []
type C = Pop<[]>;                 // never
type D = Pop<[string, boolean]>;  // [string]
```
### Вывод кортежа без первого элемента

```ts
type Shift<Type extends any[]> = Type extends [infer FirstItem, ...infer Rest] ? Rest : never;

type A = Shift<[1, 2, 3]>;     // [2, 3]
type B = Shift<[string]>;      // []
type C = Shift<[]>;            // never
type D = Shift<[boolean, number, string]>; // [number, string]
```
### Вывод реверсивного кортежа

```ts
type Reverse<Type extends any[], Accumulator extends any[] = []> = Type extends [infer FirstItem, ...infer Rest]
  ? Reverse<Rest, [FirstItem, ...Accumulator]>
  : Accumulator

type A = Reverse<["a", "b", "c"]>; // ["c", "b", "a"]
type B = Reverse<[1]>;            // [1]
type C = Reverse<[]>;             // []
type D = Reverse<[true, false, true]>; // [true, false, true] → [true, false, true]
```
### Вывод запакованного кортежа

```ts
type Zip<Tuple1 extends any[], Tuple2 extends any[], Accumulator extends any[] = []> =
  Tuple1 extends [infer FirstElement1, ...infer Rest1]
    ? Tuple2 extends [infer FirstElement2, ...infer Rest2]
      ? Zip<Rest1, Rest2, [...Accumulator, [FirstElement1, FirstElement2]]>
      : Accumulator
    : Accumulator

type A = Zip<[1, 2, 3], ["a", "b", "c"]>; // [[1, "a"], [2, "b"], [3, "c"]]
type B = Zip<[true, false], [0, 1]>;     // [[true, 0], [false, 1]]
type C = Zip<[1, 2], []>;                // []
type D = Zip<[], [1, 2]>;                // []
type E = Zip<[], []>;                    // []
```

---
## В функциях

### Вывод возвращаемого типа функции

```ts
type MyReturnType<Type extends (...args: any[]) => any> = Type extends (...args: any[]) => infer ReturnType ? ReturnType : never;

const getNumber = (a: number, b: number) => a + b;
const getArray = () => [1, "2", true];
const getNull = (a: null, b: undefined) => a;

type A = MyReturnType<typeof getNumber>; // number
type B = MyReturnType<typeof getArray>; // (string | number | boolean)[]
type C = MyReturnType<typeof getNull>; // null
type D = MyReturnType<1>; // error + never
```
### Вывод параметров функции

```ts
type MyParameters<Type extends (...args: any[]) => any> = Type extends (...args: infer Parameters) => any ? Parameters : never;

const foo = (arg1: string, arg2: number) => arg1;
const bar = (arg1: boolean, arg2: { a: 'A' }) => {};
const baz = () => [];

type A = MyParameters<typeof foo>; // [arg1: string, arg2: number]
type B = MyParameters<typeof bar>; // [arg1: boolean, arg2: { a: "A" }]
type C = MyParameters<typeof baz>; // []
type D = MyParameters<1>; // error + never
```
### Вывод только первого параметра функции

```ts
type FirstParameter<Type extends (...args: any) => any> = Type extends (x: infer FirstParameter, ...args: infer Rest) => any ? FirstParameter : never

const foo = (arg1: string, arg2: number) => arg1;
const bar = (arg1: boolean, arg2: { a: 'A' }) => {};
const baz = () => [];

type A = FirstParameter<typeof foo>; // string
type B = FirstParameter<typeof bar>; // boolean
type C = FirstParameter<typeof baz>; // unknown
type D = FirstParameter<1>; // error + never
```

---
## В объектах

TODO: Добавить ExtractValueByKey

```ts
type Obj = { id: number; name: string; active: boolean };

type A = ExtractValueByKey<Obj, "id">;      // number
type B = ExtractValueByKey<Obj, "name">;    // string
type C = ExtractValueByKey<Obj, "active">;  // boolean

// Union
type Union = { foo: number } | { foo: string };
type D = ExtractValueByKey<Union, "foo">;   // number | string
```

---
## В строковых литералах

[[String literals (строковые литералы)#При помощи `infer`|Infer]]
### Вывод массива строк, разделённых по символу

```ts
type Split<Input extends string, Delimiter extends string, Output extends string[] = []> = Delimiter extends ""
  ? never
  : Input extends `${infer First}${Delimiter}${infer Rest}`
    ? Split<Rest, Delimiter, [...Output, First]>
    : [...Output, Input]

type A = Split<"a,b,c", ",">;            // ["a", "b", "c"]
type B = Split<"hello world", " ">;      // ["hello", "world"]
type C = Split<"foo", ",">;              // ["foo"]
type D = Split<"", ",">;                 // [""]
type E = Split<"a,", ",">;               // ["a", ""]
type F = Split<",a", ",">;               // ["", "a"]
type G = Split<",", ",">;                // ["", ""]
type H = Split<"a,,b", ",">;             // ["a", "", "b"]
type I = Split<"a", "">;                 // never
type J = Split<"abc", "x">;              // ["abc"]
```

Все граничные случаи обрабатывать не вижу смысла, так как эта утилита используется в составе чего-то, а не сама по себе.

Но при помощи неё можно накинуть типизацию на `split` и получать конкретные значения на выходе при компиляции, это забавно, но в данном случае бесполезно.

```ts
const mySplit = <Input extends string, Delimiter extends string>(input: Input, delimiter: Delimiter): Split<Input, Delimiter> => {
    return input.split(delimiter) as Split<Input, Delimiter>;
}

const a = mySplit("a,b,c,d", ","); ["a", "b", "c", "d"]
```

### Вывод строкового литерала без пробелов в начале и в конце

```ts
type Whitespaces = " " | "\n" | "\t";

type Trim<Type extends string> = Type extends `${Whitespaces}${infer Rest}` | `${infer Rest}${Whitespaces}`
	? Trim<Rest>
	: Type

type A = Trim<"   hello   ">;       // "hello"
type B = Trim<"  spaced">;          // "spaced"
type C = Trim<"inline  ">;          // "inline"
type D = Trim<" no space ">;        // "no space"
type E = Trim<"">;                  // ""
type F = Trim<"    ">;              // ""
```

### Вывод длины строкового литерала

```ts
type StringToArray<Type extends string, Accumulator extends unknown[] = []> = Type extends `${infer FirstItem}${infer Rest}`
	? StringToArray<Rest, [...Accumulator, FirstItem]>
	: Accumulator

type LengthOfString<Type extends string> = StringToArray<Type>["length"];

type A = LengthOfString<"hello">;      // 5
type B = LengthOfString<"">;           // 0
type C = LengthOfString<"typescript">; // 10
type D = LengthOfString<"a b c">;      // 5
```

---
## Комбинированные паттерны

### Вывод типа из промиса

В дженерике используется `PromiseLike` вместо `Promise`, чтобы принимать объекты, у которых реализован метод `then` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables).

```ts
type MyAwaited<Type> = Type extends PromiseLike<infer AwaitedType>
	? MyAwaited<AwaitedType>
	: Type

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