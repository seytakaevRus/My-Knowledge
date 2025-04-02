## never

### Что это за тип?

Тип `never` обозначает пустоту. Если объединить этот тип с другими, то `never` просто удалится из объединения. Потому что, если к пустоте добавить что-то, то пустота исчезнет.

```ts
type A = string | never; // string
type B = number | never; // number
type C = boolean | never; // boolean
type D = any | never; // any
type E = unknown | never; // unknown
type F = void | never; // void
```

Любая из функций ниже вернёт `string`, хотя ошибка в ней может быть выброшена. `TS` удаляет тип `never`, если есть ещё тип.

```ts
const someFunction1 = (value: 0 | 1) => {
  if (value === 0) {
    return "Victory";
  }

  throw new Error("Incorrect choice");
};

const someFunction2 = (value: 0 | 1) => {
  if (value === 0) {
    throw new Error("Incorrect choice");
  }

  return "Victory";
};
```

> Поэтому не стоит использовать `never`, чтобы обозначить, что функция может вернуть ошибку. О таком способе без `never` будет рассказано [[Easy#Как можно обозначить ошибку?|ниже]].

### Когда TypeScript использует never?

`TS` вернёт `never` в двух случаях.

Либо если функция возвращает только ошибку.

```ts
const thrownError = () => {
  throw new Error("");
};
```

Либо если функция не сможет завершить своего выполнение из-за бесконечного цикла.

```ts
const infiniteLoop = () => {
  while (true) {}
};
```

Также `TS` может сам определить тип переменной как `never`, если мы делаем проверки в `if/else/else if` или `switch/case` и обрабатываем вариант, который никогда не сможет произойти.

```ts
const someFunction = (choice: 0 | 1) => {
  if (choice === 0) {
    console.log("Zero", choice); // 0
  } else if (choice === 1) {
    console.log("One", choice); // 1
  } else {
    choice; // never
  }
};
```

### Когда нам стоит использовать never?

Предположим, что у нас есть несколько узлов, у которых есть поле `type` с литералом конкретного узла и свойствами, которые встречаются только у определенного узла.

```ts
type PointNode = { type: "point"; parameterId: number; name: string };
type CommonNode = { type: "common"; name: string };
type ImageNode = { type: "image"; base64: string };

type AppNode = PointNode | CommonNode | ImageNode;
```

Есть также функция, которая на вход принимает узел типа `AppNode` и в зависимости от типа узла делает какие-то действия.

```ts
const doSomeLogic = (node: AppNode) => {
  if (node.type === "point") {
    doSomeLogicWithPointNode(node);
  } else if (node.type === "common") {
    doSomeLogicWithCommonNode(node);
  } else if (node.type === "image") {
    doSomeLogicWithImageNode(node);
  }
};
```

Теперь мы хотим добавить новый узел `TextNode`.

```ts
type TextNode = { type: "text"; fontSize: number };

type AppNode = PointNode | CommonNode | ImageNode | TextNode;
```

Если мы захоти добавить новый узел, то мы можем забыть написать для него логику обработки. Ниже мы передаём `TextNode` и `TS` не жалуется, что и логично.

```ts
doSomeLogic({ type: "text", fontSize: 14 });
```

Тут мы можем использовать `never`, чтобы при добавлении нового узла `TS` подсказывал, что мы что-то забыли.

Вернёмся в момент, когда у нас в `AppNode` было всего три узла. Как мы знаем, если добавить блок `else` в `doSomeLogic`, то тип у `node` будет равняться `never`. Мы можем этим воспользоваться, написать функцию, которая будет принимать `never` и возвращать ошибку, ведь такой ситуации не должно быть и вызывать в дополнительном блоке `else`.

```ts
const handleNever = (node: never) => {
  throw new Error("Unexpected node: ", node);
};

const doSomeLogic = (node: AppNode) => {
  if (node.type === "point") {
    doSomeLogicWithPointNode(node);
  } else if (node.type === "common") {
    doSomeLogicWithCommonNode(node);
  } else if (node.type === "image") {
    doSomeLogicWithImageNode(node);
  } else {
    handleNever(node);
  }
};
```

Теперь если мы добавим в `AppNode` узел `TextNode` и вызовем с ним `doSomeLogic`, то увидим, что `TextNode` не соответствует типу `never`. И ведь логично, мы написали обработчики для случаев, когда тип равен `point`, `common`, `image`, поэтому `TS` вычислил тип как `text`, а литерал `text` не равен типу `never`, поэтому и ошибка.

### Как можно обозначить ошибку?

Для этого потребуется написать несколько вспомогательных типов и утилит.

- `ErrorT`, который содержит сообщение об ошибке и `kind` равный `error`;
- `Success<T>`, который содержит значений и `kind` равный `success`;
- Оба типа объединяются в `Result<T>`;
- Функции `createError` и `createSuccess`, которые возвращают соответствующие типы.

```ts
type ErrorT = { kind: "error"; error: string };
type Success<T> = { kind: "success"; value: T };
type Result<T> = ErrorT | Success<T>;

const createError = (error: string): ErrorT => ({
  kind: "error",
  error,
});

const createSuccess = <T>(value: T): Success<T> => ({
  kind: "success",
  value,
});
```

Теперь нужно создать функцию `safe`, которая будет принимать функцию и значения, обозначающие аргументы переданной функции. Внутри `safe` вызов функция с аргументами оборачивается в конструкцию `try/catch`, в `try` возвращается `createSuccess`, а в `catch` `createError`.

```ts
const safe = <T>(
  callback: (...args: any[]) => T,
  ...args: any[]
): Result<T> => {
  try {
    const result = callback(...args);

    return createSuccess(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return createError(`Error: ${error?.message ?? "unknown"}`);
    }

    return createError("Unknown Error");
  }
};
```

Теперь можно передавать функцию, в которой есть выброс ошибки в функцию `safe` и получить адекватный тип о том, что может быть выброшена ошибка.

```ts
const divide = (a: number, b: number) => {
  if (b === 0) {
    throw new Error("Division by zero");
  }

  return a / b;
};

const result = safe(divide, 1, 0);

if (result.kind === "error") {
  console.error(result.error);
} else {
  console.log(result.value);
}
```
## Arrays (массивы)

Для создания типа массива достаточно использовать `[]` или дженерик `Array`.

```ts
type StringArray = string[];
type NumberArray = Array<number>;
type BooleanOrNullArray = (boolean | null)[];

const array: BooleanOrNullArray = [true, false, null];
```

Если применить оператор [[Basic#Оператор `typeof`|typeof]] к массиву, то можно получить объединение из типов элементов с `[]`

```ts
const numbers = [1, null, true, "4", () => {}];

type NumbersType = typeof numbers; // (string | number | boolean | (() => void) | null)[]
```

> Массивы изменяемые, поэтому `TS` не может дать гарантирую насчёт длины и элементов в массиве.

Если использовать `array["length"]`, то получим только тип `number`.

```ts
const numbers = [1, null, true, "4", () => {}];

type NumbersLength = (typeof numbers)["length"]; // number
```

Если использовать `array[number]`, или `array[0]` (или любой другой индекс), то получим тоже самое, что при `typeof array`, только без `[]`.

```ts
const numbers = [1, null, true, "4", () => {}];

// string | number | boolean | (() => void) | null
type NumbersElements1 = (typeof numbers)[number];
type NumbersElements2 = (typeof numbers)[0];
```

Также можно обращаться по индексу. Так как массив динамический, то вернётся объединение из элементов в массиве.

Если нужно расширить массив, то можно использовать оператор `...`, например, дженерик `Push` принимает массив и элемент, и при помощи `...` создаёт новый массив, ограничение `extends unknown[]` нужно для того, чтобы указать, что передать можно только массив.

```ts
type Push<T extends unknown[], U> = [...T, U];
```

Если применить оператор [[Basic#Оператор `keyof`|keyof]] на массив, то можно получить объединение из `number` и методов со свойствами из `Array.prototype`, это можно проверить кодом ниже.

```ts
const array = ["1", true, null, undefined];

type ArrayKeys = keyof typeof array;

type IsContainNumber = number extends ArrayKeys ? true : false; // true
type IsContainPush = "push" extends ArrayKeys ? true : false; // true
type IsContainLength = "length" extends ArrayKeys ? true : false; // true
```

Можно также использовать утилиту `Extract`, которая работает следующим образом:

1. Если `T` это не объединение, то выполняется `T extends U` и в случае успеха возвращается `T`, иначе возвращается `never`.

```ts
type A = Extract<"string", "string" | number>; // "string"
type B = Extract<boolean, "string" | number>; // never
```

2. Если `T` это объединение, то каждый тип `D` из объединения `T` прогоняется через `D extends U` и в случае успеха `D` запоминается и затем построится новое объединение, иначе возвращается `never`.

```ts
type ExtractNumber = Extract<ArrayKeys, number>; // number
type ExtactPush = Extract<ArrayKeys, "push">; // "push"
type ExtactLength = Extract<ArrayKeys, "length">; // "length"
```

Если в `tsconfig.json` в `lib` добавить `ES2022`, то код ниже тоже даст `true`.

```ts
type ExtractAt = Extract<ArrayKeys, "at">; // "at"
```

> Редко когда применяется `keyof` на массивы.

https://typehero.dev/challenge/push

## Преобразование массива/кортежа в объект

Раз нужно преобразовать в объект, то тут подойдёт [[Mapped object types (перебор типа объект)|перебор типа]]. С тем отличием, что `Key in keyof T` даст индексы и методы массива/кортежа, а нам нужно получить доступ к элементам массива, поэтому используем `Key in T[number]`. Ограничение `readonly any[]` позволяет прокидывать внутрь массивы и кортежи.

```ts
type TupleToObject<T extends readonly any[]> = {
  [Key in T[number]]: Key;
};

const a = [1, 2, 3] as const;
const b = ["true", Symbol(1), "6"] as const;

type A = TupleToObject<typeof a>; // { 1: 1, 2: 2, 3: 3 }
type B = TupleToObject<typeof b>; // { [x: symbol]: symbol, true: "true", 6: "6",  }
```

Как мы помним в `JS` ключами объекта могут быть только `string` или `symbol`, всё остальное просто преобразуется в `string`. В `TS` добавляется, что `number` также может быть ключом, так как есть обращение к массиву по индексу. Поэтому, если в `TypluToObject` закинуть не `string`, `number` или `symbol`, то `TS` будет это игнорировать.

```ts
const c = [
  () => {},
  { a: "a" },
  true,
  false,
  null,
  undefined,
  BigInt(1),
] as const;

type C = TupleToObject<typeof c>; // {}
```

Поэтому лучше ограничить передаваемый массив/кортеж на вход. Для этого есть `PropertyKey`, который является объединением из `number | string | symbol`.

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [Key in T[number]]: Key;
};
```

Теперь этот код будет выдавать ошибку.

```ts
const c = [
  () => {},
  { a: "a" },
  true,
  false,
  null,
  undefined,
  BigInt(1),
] as const;

type C = TupleToObject<typeof c>;
```

https://typehero.dev/challenge/tuple-to-object

## Типы, которые могут распадаться на более простые

Как было показано в [[Easy#Includes|Includes]] есть типы, которые распадаются на более простые, если использовать дженерики и условные типы.

### boolean

Тип `boolean` распадается на `true` и `false`.

```ts
type DistributiveBoolean<T extends boolean> = T extends true ? "yes" : "no";

type A = DistributiveBoolean<boolean>; // "yes" | "no"
```

### Пользовательское объединение

Всё, что является объединением также распадается на более простые типы.

```ts
type DistributiveCustomUnion<T> = T extends "a" ? "yes" : "no";

type B = DistributiveCustomUnion<"a" | "b">; // "yes" | "no"
```

### any

Так как `any` может быть чем угодно, то и распадается оно на что угодно.

```ts
type DistributiveAny<T extends any> = T extends "" ? "yes" : "no";

type C = DistributiveAny<any>; // "yes" | "no"
```

### Что насчёт `number` и `string`

Типы `number` и `string` являются отдельными типами, которые представляют из себя бесконечное множество литералов чисел и строк соответственно. И в отличие от `any`, который буквально обозначает "любой тип", `number` и `string` не распадаются на литералы. Это дизайнерское решение разработчиков `TS`.

```ts
type NonDistributiveNumber<T extends number> = T extends 1 ? "yes" : "no";

type A = NonDistributiveNumber<1 | 2>; // "yes" | "no"
type B = NonDistributiveNumber<number>; // "no"
```

```ts
type NonDistributiveString<T extends string> = T extends "1" ? "yes" : "no";

type C = NonDistributiveString<"1" | "2">; // "yes" | "no"
type D = NonDistributiveString<string>; // "no"
```
