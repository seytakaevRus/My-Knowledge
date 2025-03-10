## Типы данных

### Примитивы

- `number`, так как `JS` имеет только один тип для всех чисел, то `TS` также имеет только один тип, обозначающих число;
- `string`, строка переменной длины;
- `boolean`, [[Basic#Union (объединение)|объединение]] из `false` и `true`;
- `null`, собственно `null`;
- `undefined`, собственно `undefined`.

TODO: Написать про `symbol, bigint, object, never, unknown, any`.

https://typehero.dev/challenge/primitive-data-types

### Литералы

`Литерал` это подвид примитивов, обозначающих конкретное значение. Если навести курсом на переменные ниже, то там будет не тип `number`, а литерал `42`, не тип `string`, а литерал `a`, не тип `boolean`, а литерал `true`. Литералами могут быть не только примитивы, но и объекты.

```ts
const number = 42;
const string = "a";
const isTrue = true;

const object = { a: "a" },
const function = (a: string) => a;
```

Литералы могут быть полезны, когда мы хотим ограничить тип конкретным набором значений. К примеру, мы создаём тип, в котором лежат дни недели в виде строк. Кстати, это и есть [[Basic#Union (объединение)|объединение]].

```ts
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
```

И мы создаём функцию, которая ожидает на входе тип `Day`. Если в такую функцию передать значение отличное от типа `Day`, то будет ошибка.

https://typehero.dev/challenge/literal-types

## Alias (псевдоним)

Чтобы создать тип нужно использовать ключевое слово `type`.

```ts
type Year = number;
type Month = number;
type nullOrUndefined = null | undefined;
```

`TS` при сравнении таких псевдонимов смотрит на их тип, поэтому не стоит ими слишком злоупотреблять.

```ts
type Year = number;
type Month = number;

const year: Year = 2025;
const month: Month = 12;

const callback = (month: Month, year: Year) => {};

callback(year, month); // no error
```

https://typehero.dev/challenge/type-aliases
## Union (объединение)

`Union (объединение)` - набор из возможных значений, которое может принимать тип. Объединение возвращает [[Basic#Оператор `keyof`|keyof]]. Значения разделяются при помощи `|`.

```ts
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
```

Некоторые свойства об объединениях:

1. Они не упорядочены, поэтому не стоит полагаться на их порядок, в разных версиях `TS` один и тот же `union` может быть в разном порядке;
2. Они содержат только уникальные значения, то есть `union` `1 | 1 | 2 | 3` это тот же, что и `1 | 2 | 3`;
3. Тип `never`, означает, что `union` не имеет в себе элементов, следовательно пуст.

https://typehero.dev/challenge/type-unions

## Оператор `typeof`

Позволяет получить тип значения, определённого в `JS`. 

Скажем, есть библиотека `antd`, в неё есть функция `onFinishFailed`, которую можно прокинуть в компонент `Form`. Внутри функция отдаёт объект ошибки с типом `ValidateErrorEntity<>`,  он определён внутри библиотеки `antd`, но почему-то не экспортирован наружу, а свою функцию, которую я прокидываю в `Form` мне нужно типизировать. И раз тип объекта ошибки не виден снаружи, я могу его сам достать при помощи оператора `typeof` и утилит из `TS`.

```tsx
const onFinishFailed = (errorInfo: any) => {}

return (
  <Form form={form} onFinishFailed={onFinishFailed} />
)
```

Это можно сделать так.

```ts
type OnFinishFailedHandler = FormProps["onFinishFailed"];
type ErrorInfo = Parameters<Exclude<OnFinishFailedHandler, undefined>>[0];

const onFinishFailed = (errorInfo: ErrorInfo) => {}

return (
  <Form form={form} onFinishFailed={onFinishFailed} />
)
```

https://typehero.dev/challenge/typeof

## Оператор `keyof`

Работает на типах и извлекает из них объединение из ключей типа.

Например, есть объект, в котором в качестве ключа хранится значение, которое может принимать переменная. И нужно вытащить все возможные значения.

```ts
const variableType = {
  number: "number",
  boolean: "boolean",
  string: "string",
  secret: "secret",
};

type VariableTypeKeys = keyof typeof variableType;
```

Если объект будет пустой, то `keyof` вернёт `never`.

```ts
const empty = {};

type EmptyKeys = keyof typeof empty;
```

https://typehero.dev/challenge/keyof

## Generic (общий тип)

Если брать аналогию, то `generic` это своего рода функции, которые могут принимать разные типы. Они обозначаются при помощи `<>`.

### У типов или интерфейсов

Скажем, есть библиотека `reactflow` и в ней есть узлы. У них есть идентификатор `id`, тип `type` и данные `data`, в зависимости от типа в данных могут содержатся разные поля. Тип для `data` описан ниже.

```ts
type PoinData = {
  name: string;
  paramId: number;
};

type ImageData = {
  base64: string;
};
```

Как было сказано выше, есть узлы и если бы не было общих типов, то это выглядело бы так. Здесь есть общие поля `id`, и ещё много других скрытых полей, поэтому при создание узла с новым типом копировать их все как-то не хочется.

```ts
type PointNode = {
  id: string;
  type: "POINT";
  data: PoinData;
  // and other properties
}

type ImageNode = {
  id: string;
  type: "IMAGE";
  data: ImageData;
  // and other properties
}
```

Поэтому можно использовать общий тип. Это выглядит более лаконичным. Если навести курсом на `PointNode`, то можно увидеть, что `data` у него `PointData`, а `type` у него `POINT`, также и у `ImageNode`, только `ImageData` и `IMAGE` соответственно. 

```ts
type CustomNode<Type, Data> = {
	id: string;
	type: Type;
	data: Data;
}

type PointNode = CustomNode<"POINT", PoinData>;
type ImageNode = CustomNode<"IMAGE", ImageData>;
```

`TypeScript` вычисляет какие данные нужно поставить вместо общего типа.

https://typehero.dev/challenge/generic-type-arguments

### У функций

```ts
const doSomeLogicWithPointNode = <PointNode,>(node: PointNode) => {
   ///
}
```

Через запятую сделано для совместимости с `React`, так как там есть `JSX`, специальный синтаксис для разметки, который тоже начинается с `<>`, поэтому компилятору не понятно, что перед ним `JSX` или `generic`.

### Ограничения

В примерах выше в `CustomNode` можно передать вообще любые значения, то есть:

```ts
type WrongNode1 = CustomNode<5, "aaa">;
type WrongNode2 = CustomNode<true, () => {}>;
type WrongNode3 = CustomNode<{}, null>;
```

А нам нужно, чтобы `type` был строкой, причём вполне конкретной строкой, то есть литералом, а `data` объектом. Для создания ограничений можно использовать `extends`.

```ts
type NodeType = "POINT" | "IMAGE";
type OnlyObject<T> = T extends (...args: any) => any ? never : T;

type CustomNode<Type extends NodeType, Data extends { [key: string]: any }> = {
	id: string;
	type: Type;
	data: Data;
}
```

Правда при таком типе во второй аргумент можно закинуть всё, что расценивается как объект, функцию/массив. Пока не нашёл, как это исправить.

TODO: Мб, есть какой-то хак?

