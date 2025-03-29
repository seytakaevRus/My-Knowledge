## Conditional types (условные типы)

Благодаря ключевому слову `extends` можно в зависимости от условия возвращать один из двух типов.

```ts
type Conditional<T, U> = T extends U ? true : false; 
```

Если тип `T` является подтипом типа `U`, то вернётся `true`, иначе вернётся `false`.  Когда тип является подтипом другого?

### Если `T` и `U` это пользовательские типы

Если тип `T` содержит все свойства типа `U`, то `T` является подтипом `U`.

```ts
type A = { name: string };
type B = { name: string; age: number };
type C = { name: number }

type D = B extends A ? true : false; // true
type E = A extends B ? true : false; // false

type F = C extends A ? true : false; // false
type G = A extends C ? true : false; // false
```

Выше тип `B` содержит все свойства `A` (`name` есть в обоих типах), поэтому `B` является подтипом типа `A`, поэтому `D` содержит в себе `true`. Но `A` не содержит в себе всех свойств `B` (в `A` нет `age`), поэтому `E` содержит в себе `false`.

`C` не является подтипом `A`, также как и `A` не является подтипом `C`, поэтому тип `F`, как и `G` содержит в себе `false`.

### Если `T` и `U` это встроенные типы

Если `T` менее общий, а `U` более общий тип, то `T` является подтипом `U` или по-другому, если `T` содержится в типе `U`, то `T` это подтип `U`.

```ts
type A = number extends any ? true : false; // true
type B = any extends number ? true : false; // boolean

type C = number extends string ? true : false; // false

type D = [] extends any[] ? true : false; // true
type E = any[] extends [] ? true : false; // false

type F = {} extends Record<string, string> ? true : false; // true
```

В `any` содержится `number`, поэтому `A` содержит `true`. `any` может принимать разные типы, если `any` это `number`, то `B` вернёт `true`, а если же `any` это строка, то вернёт `false`, поэтому `B` содержит `boolean`.

Пустой массив `[]` содержится в `any[]`, поэтому `D` это `true`, но не наоборот.

Пустой объект содержится в `Record<string, string>`, поэтому `F` это `true`.

Если тип слева от `extends` может быть назначен типу справа, то получится тип после `?`, если же тип не может быть назначен, то получится тип после `:`.

Также это работает и с [[Basic#Union (объединение)|объединениями]].

```ts
type A = "hello" extends string ? true : false; // true

type B = "yes" | "no" extends "yes" | "no" | "maybe" ? true : false; // true
```

Тип `string` это по сути объединение из бесконечного количество строк, поэтому в них содержится строка `hello` и `A` вернёт `true`.

Юнион `yes | no | maybe` включает в себя юнион `yes | no`, поэтому `B` вернёт `true`.

### Применение условных типов

Например, мы создаём тип `First`, который принимает дженерик, являющегося массивом, и возвращает его первый элемент, либо `never`, если был передан не массив.

```ts
type First<T extends unknown[]> = T extends [] ? never : T[0];
```

В данном случаем `[]` обозначает пустой массив и мы проверяем, может ли пустой массив содержать в себе `T` (а такое возможно только, если `T` и есть пустой массив), если да, то в `T` нет элементов, так как он пуст, поэтому возвращаем `never`, иначе возвращаем `T[0]` ([[Basic#Indexed types (получение типа по ключу)|освежить]]).

https://typehero.dev/challenge/first-of-array
https://typehero.dev/challenge/if

### Distributive conditional types (распределительные условных типов)

Если нужно изменить элементы объединения или отфильтровать объединение, то тут нужно использовать сочетание условного типа и [[Basic#Generic (общий тип)|дженериков]].

Общий синтаксис:

```ts
type Generic<T, K> = T extends K ? never : T;
```

Как это работает?

1. `T` находится слева от `extends`, поэтому если `T` это объединение, то для каждого типа `type` из `T` будет выполняться условие `type extends K ? never : type`, при возвращении `never` тип `type` не попадёт в конечное объединение;
2. Если `T` это тип, а не объединение, то просто выполнится `type extends K ? never : type` и также при возвращении `never` `type` не попадёт в конечное объединение.

Например, у нас есть объединение из примитивов, а мы хотим получить объединение из объектов, с ключом `type`, где значением будет тип из входящего объединения.

```ts
type UnionToObject<Union> = Union extends any ? { type: Union } : never;

type Union = number | string | null | undefined | symbol;
type UnionObject = UnionToObject<Union>; // { type: undefined } | { type: number } | { type: string } | { type: null } | { type: symbol } | 
```

Или есть объединение и мы хотим убрать из него некоторые элементы, получив на выходе другое объединение.

```ts
type MyExclude<BaseUnion, UnionWithTypesForDelete> = BaseUnion extends UnionWithTypesForDelete ? never : BaseUnion;

type Union = number | string | null | undefined | symbol;
type TransformedUnion = MyExclude<Union, null | undefined | symbol>;
```
## never

### Что это за тип?

Тип `never` обозначает пустоту. Если объединить этот тип с другими, то `never` просто удалится из объединения. Потому что, если к пустоте добавить что-то, то пустота исчезнет.

```ts
type A = string | never;   // string
type B = number | never;   // number
type C = boolean | never;  // boolean
type D = any | never;      // any
type E = unknown | never;  // unknown
type F = void | never;     // void
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
}
```

Либо если функция не сможет завершить своего выполнение из-за бесконечного цикла.

```ts
const infiniteLoop = () => {
	while (true) {}
}
```

Также `TS` может сам определить тип переменной как `never`, если мы делаем проверки в `if/else/else if` или `switch/case` и обрабатываем вариант, который никогда не сможет произойти.

```ts
const someFunction = (choice: 0 | 1) => {
	if (choice === 0) {
		console.log("Zero", choice); // 0
	} else if (choice === 1) {
		console.log("One", choice); // 1
	} else {
		choice // never
	}
}
```

### Когда нам стоит использовать never?

Предположим, что у нас есть несколько узлов, у которых есть поле `type` с литералом конкретного узла и свойствами, которые встречаются только у определенного узла.

```ts
type PointNode = { type: "point", parameterId: number, name: string };
type CommonNode = { type: "common", name: string }
type ImageNode = { type: "image", base64: string };

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
}
```

Теперь мы хотим добавить новый узел `TextNode`.

```ts
type TextNode = { type: "text", fontSize: number };

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
}

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
}
```

Теперь если мы добавим в `AppNode` узел `TextNode` и вызовем с ним `doSomeLogic`, то увидим, что `TextNode` не соответствует типу `never`. И ведь логично, мы написали обработчики для случаев, когда тип равен `point`, `common`, `image`, поэтому `TS` вычислил тип как `text`, а литерал `text` не равен типу `never`, поэтому и ошибка.

### Как можно обозначить ошибку?

Для этого потребуется написать несколько вспомогательных типов и утилит.

- `ErrorT`, который содержит сообщение об ошибке и `kind` равный `error`;
- `Success<T>`, который содержит значений и `kind` равный `success`;
- Оба типа объединяются в `Result<T>`;
- Функции `createError` и `createSuccess`, которые возвращают соответствующие типы.

```ts
type ErrorT = { kind: "error", error: string };
type Success<T> = { kind: "success", value: T };
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

## Mapped object types (перебор типа). Продолжение

### Модификаторы

При переборе типа можно добавлять или удалять модификаторы. Всего есть два модификатор:

- `readonly` - модификатор, говорящий, что поле только для чтения;
- `?` - модификатор, говорящий, что поле опциональное.

`+` добавляет модификатор, а `-` его удаляет, использование без знака `readonly` и `?` равносильно использованию `+`.

```ts
const customObject = {
  number: 5,
  string: "435",
  array: [1, 2, 3],
  object: {},
}

type CustomObject = typeof customObject;

type MyReadonly<T> = {
  readonly [Key in keyof T]: T[Key];
};
type ReadonlyCustomObject = MyReadonly<CustomObject>;

type MyMutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};
type MutableCustomObject = MyMutable<ReadonlyCustomObject>;

type MyPartial<T> = {
  [Key in keyof T]?: T[Key];
}
type PartialCustomObject = MyPartial<CustomObject>;

type MyRequired<T> = {
  [Key in keyof T]-?: T[Key];
}
type RequiredCustomObject = MyRequired<PartialCustomObject>;
```

https://typehero.dev/challenge/readonly

### Удаление ключей

При переборе типов есть возможность удалять это делается при помощи оператора `as`.

```ts
type MyPick<Type, Keys extends keyof Type> = {
	[Property in keyof Type as Property extends Keys ? Property : never]: Type[Property];
};

const example = {
	number: 42,
	string: "Hello",
	boolean: true,
};

type A = MyPick<typeof example, "number"> // { number: "number" }
```

1. `Keys extends keyof Type` накладывает ограничение на `Keys`, дженерик должен принимать в себя только те типы, которые являются ключами `Type`;
2. `Property in keyof Type` перебирает ключи из `Type`;
3. `as` говорит о том, что дальше будет идти инструкция, которая вернёт ключ;
4. `Property extends Keys ? Property : never`, возвращает либо сам ключ, либо `never`, и в таком случае ключ пропускается. 

Если `extends` перенести из ключа в значение, то ключи бы не удалялись, просто значения у них было бы, либо оригинальным, либо `never`.

```ts
type WrongMyPick<Type, Keys extends keyof Type> = {
	[Property in keyof Type]: Property extends Keys ? Property : never;
};

const example = {
	number: 42,
	string: "Hello",
	boolean: true,
};

type A = WrongMyPick<typeof example, "number"> // { number: "number", string: never, boolean: never }
```

Интересно то, что выше `MyPick` можно реализовать проще. При переборе типа обычно пишем `in keyof Type`, который перебирает ключи из объединение, а тут мы сразу передали нужное объединение и достаём из него ключи.

```ts
type MyPick<Type, Keys extends keyof Type> = {
	[Property in Keys]: Type[Property];
};
```

https://typehero.dev/challenge/pick

Ещё можно таким образом реализовать `MyOmit`, который принимает тип и ключи из этого типа, дженерик возвращает новый тип, из которого удалены переданные ключи.

```ts
type MyOmit<Type, Keys extends keyof Type> = {
	[Property in keyof Type as Property extends Keys ? never : Property]: Type[Property];
};
```

https://typehero.dev/challenge/omit

### Изменение ключей

Также оператор `as` может использоваться для изменение ключей, например, добавить к каждому ключу `_` в начало. В `Property` может содержаться `number | string | symbol`, поэтому при помощи `Extract` `Property` приводится к строке.

```ts
type AddUnderscore<Type> = {
	[Property in keyof Type as `_${Extract<Property, string>}`]: Type[Property];
};

const example = {
	number: 42,
	string: "Hello",
	boolean: true,
};

type A = AddUnderscore<typeof example>; // { _number: number, _string: string, _boolean: boolean }
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

type NumbersLength = typeof numbers["length"]; // number
```

Если использовать `array[number]`, или `array[0]` (или любой другой индекс), то получим тоже самое, что при `typeof array`, только без `[]`.

```ts
const numbers = [1, null, true, "4", () => {}];

// string | number | boolean | (() => void) | null
type NumbersElements1 = typeof numbers[number]; 
type NumbersElements2 = typeof numbers[0];
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

## Tuples (кортежи)

В отличие от массива кортеж является неизменяемым типом, поэтому идёт с модификатором `readonly`.

Для создания кортежа достаточно использовать возле массива `as const`. Важно то, что использовать следует возле значения массива, а не возле типа.

```ts
const array = [1, "2", true, null] // (string | number | boolean | null)[]
const tuple = [1, "2", true, null] as const; // readonly [1, "2", true, null]
```

Благодаря тому, что массив теперь неизменяемый возвращаются литералы, а не просто типы.

Также, теперь при использовании `tuple["length"]` возвращается литерал, а не просто тип `number`.

```ts
type TupleLength = typeof tuple["length"]; // 4
```

Также, если использовать `tuple[number]` или `tuple[0]` (или любой другой индекс), то получим юнион из литералов, а не из типов.

```ts
type TupleItems1 = typeof tuple[number]; // true | 1 | "2" | null
type TupleItems2 = typeof tuple[0]; // true | 1 | "2" | null
```

Применение `keyof` на кортеж вернёт `number` (в него собираются индексы), литералы индексов в виде строк и методы со свойствами из `Array.prototype`, исключая те, которые могут изменять массив `push`, `pop`, ...

```ts
const tuple = [1, "2", true, null] as const;

type TupleKeys = keyof typeof tuple;

type ExtractNumber = Extract<TupleKeys, number>; // number
type ExtractString = Extract<TupleKeys, string>; // "2" | "0" | "1" | "3" | "length" | "toString" | ...
type ExtractPush = Extract<TupleKeys, "push">; // never
type ExtractSlice = Extract<TupleKeys, "slice">; // "slice"
```

> Редко когда применяется `keyof` на кортежи.

Если нужно, чтобы в дженерик мог передаваться кортеж, то нужно использовать `extends readonly any[]`. Такая запись позволит передавать и массивы, и кортежи.

```ts
type Length<T extends readonly any[]> = T["length"];
```

Для расширения кортежей также нужно использовать оператор `...`.

```ts
type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];
```

https://typehero.dev/challenge/concat
https://typehero.dev/challenge/length-of-tuple

## Преобразование массива/кортежа в объект

Раз нужно преобразовать в объект, то тут подойдёт [[Basic#Mapped object types (перебор типа)|перебор типа]]. С тем отличием, что `Property in keyof T` даст индексы и методы массива/кортежа, а нам нужно получить доступ к элементам массива, поэтому используем `Property in T[number]`. Ограничение `readonly any[]` позволяет прокидывать внутрь массивы и кортежи.

```ts
type TupleToObject<T extends readonly any[]> = {
	[Property in T[number]]: Property;
};

const a = [1, 2, 3] as const;
const b = ["true", Symbol(1), "6"] as const;

type A = TupleToObject<typeof a>; // { 1: 1, 2: 2, 3: 3 }
type B = TupleToObject<typeof b>; // { [x: symbol]: symbol, true: "true", 6: "6",  }
```

Как мы помним в `JS` ключами объекта могут быть только `string` или `symbol`, всё остальное просто преобразуется в `string`. В `TS` добавляется, что `number` также может быть ключом, так как есть обращение к массиву по индексу. Поэтому, если в `TypluToObject` закинуть не `string`, `number` или `symbol`, то `TS` будет это игнорировать.

```ts
const c = [() => {}, {a: "a"}, true, false, null, undefined, BigInt(1)] as const;

type C = TupleToObject<typeof c>; // {}
```

Поэтому лучше ограничить передаваемый массив/кортеж на вход. Для этого есть `PropertyKey`, который является объединением из `number | string | symbol`.

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
	[Property in T[number]]: Property;
};
```

Теперь этот код будет выдавать ошибку.

```ts
const c = [() => {}, {a: "a"}, true, false, null, undefined, BigInt(1)] as const;

type C = TupleToObject<typeof c>;
```

https://typehero.dev/challenge/tuple-to-object

## infer

Ключевое слово `infer` используется только с [[#Conditional types (условные типы)|условными типами]] и позволяет выводить тип типа из другого типа.

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

## Strict type equality (строгое равенство типов)

Нужно создать дженерик `StrictEqual`, который бы возвращал `true`, если типы строго равны и `false` в противном случае. Что значит строго? Это значит что тип равен только себе, то есть `StrictEqual<true, true>` должен вернуть `true`, а `StrictEqual<true, boolean>` вернуть `false`.

Первое, что приходит в голову это использовать оператор `extends`, причём два раза, скажем, есть тип `T` и `U`, то сначала делаем `T extends U`, а затем `U extends T` и проверяем их возвращаемый результат. Для удобства будет использовать `1` и `0`, потому что это всего один символ, хотя можно использовать и привычные `true` с `false`.

```ts
type StrictEqual<T, U> =
  (T extends U ? 1 : 0) extends (U extends T ? 1 : 0)
    ? true
    : false;
```

Но если проверить результат, то окажется, что `StrictEqual` не так, как ожидалось.

```ts
type Test = StrictEqual<true, boolean>; // true
```

Но почему, ведь код ниже работает корректно.

```ts
type A = true extends boolean ? 1 : 0; // 1
type B = boolean extends true ? 1 : 0; // 0
type C = A extends B ? true : false; // false
```

Рассмотрим подробно как выполняется `StrictEqual<true, boolean>`:

1. Сначала `TS` видит `(T extends U ? 1 : 0)`, которое превращается в `true extends boolean ? 1 : 0` и возвращается `1`;
2. Затем `TS` видит `(U extends T ? 1 : 0)` и раз `U` это `boolean`, которое является по сути объединением из `true` и `false`, то `TS` [[Easy#Distributive conditional types (распределительные условных типов)|разворачивает]] условие на следующие два `(true extends true ? 1 : 0)` и `(false extends true ? 1 : 0)`, раз первое возвращает `1`, а второе `0`, то возвращается `1 | 0`.
3. В конечном итоге имеем следующие выражение `1 extends 1 | 0 ? true : false`, что справедливо возвращает `true`;

Проверить второй пункт можно также при помощи дженерика `HalfSimpleEqual`.

```ts
type HalfSimpleEqual<T, U> = U extends T ? 1 : 0;

type A = HalfSimpleEqual<true, boolean>; // 1 | 0
```

В таком случае могут помочь функции, потому что они не поддерживают распределение.

```ts
type F1<T> = <G>() => G extends T ? 1 : 0;
type F2<U> = <G>() => G extends U ? 1 : 0;

type StrictEqual<T, U> = F1<T> extends F2<U> ? true : false;

type A = StrictEqual<true, boolean>; // false
type B = StrictEqual<boolean, true>; // false
```

Здесь `G` является дженериком внутри анонимной функции, которая никогда не будет вызвана, поэтому этот дженерик так и останется абстрактным и в него никак нельзя передать значение. В его использовании только один смысл, дать возможность `TS` проверять всю сигнатуру функции.

```ts
Вызов StrictEqual<true, boolean> даст два вызова

F1<true>, который превратится в <G>() => G extends true ? 1 : 0
и F2<boolean>, который превратится в <G>() => G extends boolean ? 1 : 0

TS сравнит сравнит <G>() => G extends true ? 1 : 0 и <G>() => G extends boolean ? 1 : 0, и выдаст, что они не одинаковые
```
## Includes

Нужно реализовать дженерик `Includes<Array, Item>`, который принимает тип массива и тип, дженерик проводит строгое соответствие между `Item` и типом из `Array` и если они совпадают, то возвращает `true`, иначе возвращает `false`.

Первая идея, которая пришла в голову была использовать `Array[number]`, чтобы получить объединение из типов элементов в массиве, а затем проходимся по каждому элементу, используя [[Easy#Distributive conditional types (распределительные условных типов)|дистрибутивный тип]].

Но, если в массиве будет тип, например, `boolean`, который при распределении распадается на другие типы, `true` и `false`, то код корректно не будет работать ([[Easy#Типы, которые могут распадаться на более простые|типы, которые могут распадаться]]). Поэтому нужно искать другой подход перебора массива.

Из `JS` мы знаем, что массив можно перебрать итеративно и рекурсивно, раз итеративно не подошло, сделаем это рекурсивно.

```ts
type StrictEqual<T, U> = (<G>() => G extends T ? 1 : 0) extends (<G>() => G extends U ? 1 : 0) ? true : false;

type Includes<Array extends readonly any[], Item> =
	Array extends [infer FirstItem, ...infer Rest]
		? StrictEqual<FirstItem, Item> extends false 
			? Includes<Rest, Item>
			: true
		: false;
```

Как работает `StrictEqual` можно посмотреть [[Easy#Strict type equality (строгое равенство типов)|здесь]]. Идея состоит в том, чтобы вытягивать из `Array` первый элемент и остаток, первый сравнивается с `Item` и если тот даёт `false`, то переходим в следующий вызов рекурсии, иначе выходим из рекурсии. Благодаря конструкции `[infer FirstItem, ...infer Rest]` можно получить первый элемент и остаток типа массива.

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
type B = NonDistributiveNumber<number> // "no"
```

```ts
type NonDistributiveString<T extends string> = T extends "1" ? "yes" : "no";

type C = NonDistributiveString<"1" | "2">; // "yes" | "no"
type D = NonDistributiveString<string> // "no"
```

