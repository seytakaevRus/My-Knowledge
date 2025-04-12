
`Кортеж` - тип в `TypeScript`. Является частным случаем массива с фиксированной длинной и типами по позициям. 

---
## Создание кортежа

Создать кортеж можно из массива при помощи `as const`.

```ts
const array = [1, "2", true, null] // (string | number | boolean | null)[]
const tuple = [1, "2", true, null] as const; // readonly [1, "2", true, null]
```

С точки зрения значений `array` и `tuple` это массивы, но с точки зрения типов `array` это массив, а `tuple` это кортеж.

> Преобразовать массив в кортеж можно только на уровне значений при помощи `as const`. Нельзя сделать преобразование на уровне типов.

Создать также можно, если указать явно тип кортежа.

```ts
const tuple: [1, number] = [1, 4];
```

---
## `tuple["length"]`

`tuple["length"]` возвращается литерал, а не просто тип `number`.

```ts
type TupleLength = typeof tuple["length"]; // 4
```

---
## `tuple[number]`

`tuple[number]` вернёт объединение из литералов.

```ts
type TupleItems = typeof tuple[number]; // true | 1 | "2" | null
```

---
## `tuple[index]`

`tuple[index]` вернёт конкретный литерал.

```ts
type TupleElement1 = typeof tuple[0]; // 1
type TupleElement2 = typeof tuple[8]; // error + undefined
```

---
## `keyof`

[[keyof]] на кортеж вернёт:

- `number` (в него собираются индексы);
- литералы индексов в виде строк;
- методы и свойства из `Array.prototype`, исключая те, которые могут изменять массив `push`, `pop` и т.д.

```ts
const tuple = [1, "2", true, null] as const;

type TupleKeys = keyof typeof tuple;

type ExtractNumber = Extract<TupleKeys, number>; // number
type ExtractString = Extract<TupleKeys, string>; // "2" | "0" | "1" | "3" | "length" | "toString" | ...
type ExtractPush = Extract<TupleKeys, "push">; // never
type ExtractSlice = Extract<TupleKeys, "slice">; // "slice"
```

---
## Ограничение на приём только кортежей и массивов

`extends readonly any[]` ограничивает, чтобы передавать можно было только массивы или кортежи.

```ts
type Length<Tuple extends readonly any[]> = Tuple["length"];

const array = [1, 2, 3];
const tuple = [1, 2, 3] as const;

type A = Length<typeof array>; // array, hence returns number

type B = Length<typeof tuple>; // tuple, hence returns 3
type C = Length<[1, 2]>; // tuple, hence returns 2
```

Как было сказано [[Tuples (кортежи)#Создание кортежа|выше]], кортеж можно сделать при помощи `as const`, либо передать явно, поэтому `B` и `C` возвращают литерал.

https://typehero.dev/challenge/length-of-tuple

---
## Особенности при работе с функциями

Предположим, что нужно создать аналог функции `Promise.all`, но сфокусируемся только на типизации. Функция может принимать массивы и кортежи, функция будет возвращать кортеж, обёрнутый в `Promise`.

Раз функция может принимать массивы, то [[#При помощи `infer`|перебор при помощи infer]] не подойдёт. Для реализации нужно использовать [[Arrays (массивы)#При помощи `mapped types`|перебор при помощи mapped types]] и к каждому элементу применить `Awaited`. Получаем реализацию ниже.

```ts
declare function PromiseAll<ArrayType extends readonly unknown[]>
	(values: ArrayType): Promise<{
		[Key in keyof ArrayType]: Awaited<ArrayType[Key]>
	}>;

const test1 = PromiseAll([1, 2, "3"]); // Promise<(string | number)[]>
const test2 = PromiseAll([1, 2, "3"] as const); // Promise<readonly [1, 2, "3"]>
```

Как видим `test1` вывел `Promise<(string | number)[]>`, а нам нужно выводить кортеж, так как `PromiseAll` не меняет порядок элементов в принимаемом массиве.

Для этого можно использовать "хак" `values: [...ArrayType]`. Благодаря нему `TS` сохраняет структуру переданного массива и на выходе возвращает кортеж.

```ts
declare function PromiseAll<ArrayType extends readonly unknown[]>
	(values: [...ArrayType]): Promise<{
		[Key in keyof ArrayType]: Awaited<ArrayType[Key]>
	}>;

const test1 = PromiseAll([1, 2, "3"]); // Promise<[number, number, string]>
const test2 = PromiseAll([1, 2, "3"] as const); // Promise<[1, 2, "3"]>
```

https://typehero.dev/challenge/promise-all

---
## Расширение кортежа

Для расширения кортежа используется оператор `...`.

```ts
const tuple1 = [1, 2, 3] as const;
const tuple2 = [4, 5, 6] as const;

type Concat<Tuple1 extends readonly any[], Tuple2 extends readonly any[]> = [...Tuple1, ...Tuple2];

type A = Concat<typeof tuple1, typeof tuple2>; // [1, 2, 3, 4, 5, 6]
```

https://typehero.dev/challenge/concat

---
## Перебор кортежа

### При помощи `mapped types`

Кортеж можно перебрать при помощи `mapped types` и он не отличается от [[Arrays (массивы)#При помощи `mapped types`|перебора массива]].

Но чем хорош кортеж, так это добавлением перебора при помощи `infer`.
### При помощи `infer`

Например дженериком ниже можно превратить кортеж в объединение, имитируя использование `T[number]`.

```ts
type ArrayToUnion<ArrayType extends unknown[]> = ArrayType extends [infer FirstItem, ...infer Rest]
    ? FirstItem | ArrayToUnion<Rest>
    : never;

type A = ArrayToUnion<[1, 2, 3, 4]>; // 1 | 2 | 3 | 4
type B = ArrayToUnion<[]>; // never
type C = ArrayToUnion<[1, "d", {}, null]>; // {} | 1 | "d" | null
```

При помощи него можно перебрать кортеж и вернуть на его основе единственное значение, как это сделано в [[includes]].

Ещё можно вернуть новый кортеж, положив туда необходимые данные из базового массива, как это сделано в [[without]]


TODO: Добавить ограничение на приём только кортежей