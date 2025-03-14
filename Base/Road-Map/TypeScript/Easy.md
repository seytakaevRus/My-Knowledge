## Conditional types (условные типы)

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
- Функции `error` и `success`, которые возвращают соответствующие типы.

```ts
type ErrorT = { kind: "error", error: string };
type Success<T> = { kind: "success", value: T };
```

TODO: Дописать
https://oida.dev/typescript-never-and-error-handling/

## Mapped object types (перебор типа). Продолжение

```ts
type MyReadonly<T> = {
	readonly [Key in keyof T]: T[Key];
};
```

https://typehero.dev/challenge/readonly