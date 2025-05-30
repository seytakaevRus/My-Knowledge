## Что это за тип?

Тип `never` обозначает пустоту. Если объединить этот тип с другими, то `never` исчезнет из объединения. Если к пустоте добавить что-то - пустота исчезнет. ^3f5660

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

> Поэтому не стоит использовать `never`, чтобы обозначить, что функция может вернуть ошибку. Для этого существует другой [[Easy#Как можно обозначить ошибку?|способ]].

---
## Поведение при сравнении

Раз `never` - пустота, то она является [[Conditional types (условные типы)#Если `T` и `U` это встроенные типы|наименее общим]] типом, поэтому при `never` в левой стороне `extends` всегда вернёт `true`.

```ts
type A = never extends boolean ? true : false; // true
type B = never extends number ? true : false; // true
type C = never extends string ? true : false; // true
type D = never extends symbol ? true : false; // true
type E = never extends object ? true : false; // true
type F = never extends [] ? true : false; // true
type G = never extends Function ? true : false; // true
type H = never extends 'wtf' ? true : false; // true
type I = never extends never ? true : false; // true
```

Отсюда и следует то, что если `never` стоит в правой части, `extends` всегда вернёт `false`, если слева не `never`.

```ts
type A = boolean extends never  ? true : false; // false
type B = number extends never  ? true : false; // false
type C = string extends never  ? true : false; // false
type D = symbol extends never  ? true : false; // false
type E = object extends never  ? true : false; // false
type F = [] extends never  ? true : false; // false
type G = Function extends never  ? true : false; // false
type H = 'wtf' extends never ? true : false; // false
type I = never extends never ? true : false; // true
```

---
## Поведение при дистрибутивности

При использовании `never` с [[Distributive types (распределение типа)|распределением типа]], будет всегда возвращён `never`.

```ts
type Distributive<Type> = Type extends never ? 1 : 0;

type A = Distributive<string>; // 0
type B = Distributive<never>; // never
```

Это поведение кажется странным, условный тип может вернуть значение из веток, но `never` не прописано в ветках. Раз `never` обозначает пустоту, то из неё ничего нельзя вытянуть и распределение не сможет выполниться, поэтому `TS` в таких случаях возвращает `never`.

Если всё-таки есть необходимость передачи `never` для дальнейшего сравнения можно использовать синтаксис `[]`, который:

TODO: Добавить ссылку на дистрибутивность.

1. Запрещает распределение типа (ниже это `Type`);
2. Позволяет `TS` производить сравнение с `never`.

```ts
type IsNever<Type> = [Type] extends [never] ? true : false;
```

>`never` должно ставиться строго справа по [[#Поведение при сравнении|этой причине]]. `StrictEqual` можно также использовать, но там важно, чтобы передаваемые дженерики стояли справа от `extends`, тогда можно обрабатывать `never`.

TODO: Написать про использование работает с {}, не работает с () => {}

---
## Когда `TypeScript` ещё использует never?

`TS` вернёт `never` в трёх случаях.

Если функция возвращает только ошибку.

```ts
const thrownError = () => {
  throw new Error("");
};
```

Если функция не сможет завершить своего выполнение из-за бесконечного цикла.

```ts
const infiniteLoop = () => {
  while (true) {}
};
```

Если мы делаем проверки в `if/else if` или `switch/case` и обрабатываем вариант, который никогда не сможет произойти.

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

---
## Когда нам стоит использовать never?

Предположим, что у нас есть несколько узлов, у которых есть поле `type` с литералом конкретного узла и свойствами, которые встречаются только у определенного узла.

```ts
type PointNode = { type: "point"; parameterId: number; name: string };
type CommonNode = { type: "common"; name: string };
type ImageNode = { type: "image"; base64: string };

type AppNode = PointNode | CommonNode | ImageNode;
```

Есть также функция, которая на вход принимает узел тип `AppNode` и в зависимости от типа узла делает какие-то действия.

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

---
## Как можно обозначить ошибку?

Для этого потребуется написать несколько вспомогательных типов и утилит.

- `ErrorT`, который содержит сообщение об ошибке и `kind` равный `error`;
- `Success<T>`, который содержит значение, равное `T`,  и `kind` равный `success`;
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