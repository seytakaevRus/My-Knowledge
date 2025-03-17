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
type First<T extends any[]> = T extends [] ? never : T[0];
```

В данном случаем `[]` обозначает пустой массив и мы проверяем, может ли пустой массив содержать в себе `T` (а такое возможно только, если `T` и есть пустой массив), если да, то в `T` нет элементов, так как он пуст, поэтому возвращаем `never`, иначе возвращаем `T[0]` ([[Basic#Indexed types (получение типа по ключу)|освежить]]).

https://typehero.dev/challenge/first-of-array
https://typehero.dev/challenge/if
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
  } catch (error: any) {
    return createError(`Error: ${error?.message ?? "unknown"}`);
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

## Arrays (массивы)

https://typehero.dev/challenge/push

## Tuples (кортежи)

https://typehero.dev/challenge/concat