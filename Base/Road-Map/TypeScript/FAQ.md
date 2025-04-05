## `(...args: any[]) => any` vs `Function`

Ограничить тип, чтобы туда можно было передать только функцию можно через: `(...args: any[]) => any` или `Function`, но в чём разница?
### (...args: any[]) => any

Такая конструкция даёт нам контроль над типом для параметров и над типом для возвращаемого значения. Также конструкция явно определяет, что перед нами функция, которую можно вызвать.

```ts
type OnlyFunction<FunctionType extends (...args: any[]) => any> = FunctionType;

type A = OnlyFunction<() => {}>;

const test = (callback: (...args: number[]) => number) => {
  callback();
}

const sum = (a: number, b: number) => a + b;

test(sum);
```

> Его использование возможно, когда нужен обобщённый тип, но лучше вместо `any` использовать конкретные типы.
### Function

Такой тип говорит, что перед нами функция, но не даёт контроля над типами параметров или возвращаемого значения.

```ts
type OnlyFunction<FunctionType extends Function> = FunctionType; // так не делать!
```

> Его использование не рекомендуется.

---
## `Object` vs `{}` vs `object` vs `Record<string, any>` vs `{ [key: string]: any }`

### `Object`

Это тип, который означает `Object` в `JS`, то есть почти всё. `Object` не включает в себя `null` и `undefined` и некоторые другие типы.

```ts
type A = 1 extends Object ? true : false; // true
type B = "" extends Object ? true : false; // true
type C = true extends Object ? true : false; // true
type D = symbol extends Object ? true : false; // true
type E = (() => {}) extends Object ? true : false; // true
type F = [] extends Object ? true : false; // true
type G = {} extends Object ? true : false; // true

type H = undefined extends Object ? true : false // false
type I = null extends Object ? true : false // false
```

> Его использование не рекомендуется.
### `{}`

Ведёт себя также как и `Object`, но не проверяет типизацию совсем.

```ts
let x: {} = {toString() { return 2 }} // ok
let y: Object = {toString() { return 2 }} // Error: Type '() => number' is not assignable to type '() => string'.
```

> Его использование не рекомендуется.

### `object`

Этот тип включается в себя массивы, функции и объекты.

```ts
type A = 1 extends object ? true : false; // false
type B = "" extends object ? true : false; // false
type C = true extends object ? true : false; // false
type D = symbol extends object ? true : false; // false

type E = (() => object) extends object ? true : false; // true
type F = [] extends object ? true : false; // true
type G = {} extends object ? true : false; // true

type H = undefined extends object ? true : false // false
type I = null extends object ? true : false // false
```

> Его использование возможно, но обычно функции, объекты и массивы не смешивают.

---

## `any[]` vs `Array` vs `[`



### Только объект

### Только массив

## Как определить, что перед тобой тип функции?

## Как определить, что перед тобой тип массива?

## Как определить, что перед тобой тип объекта?

## Как перебрать тип массива?

## Как перебрать тип объекта (поверхностно и рекурсивно)?

## Как отфильтровать объединение?

## Как добавить к типу объекту новый тип объекта?

## Как добавить к типу массиву новый тип элемент?