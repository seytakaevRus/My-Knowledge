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

