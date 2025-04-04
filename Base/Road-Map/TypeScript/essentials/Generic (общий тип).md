
Если брать аналогию, то `generic` это своего рода функции, которые могут принимать разные типы. Они обозначаются при помощи `<>`.

## У типов

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

## У функций

Для передачи дженерика в стрелочную функцию нужно использовать `<>` перед параметрами.

```ts
const identity = <T,>(parameter: T) => parameter;
```

Через запятую сделано для совместимости с `React`, так как там есть `JSX`, специальный синтаксис для разметки, который тоже начинается с `<>`, поэтому компилятору не понятно, что перед ним `JSX` или `generic`.

При вызове функции можно передавать дженерик:

```ts
identity<string>("who am I?");
```

А можно не передавать:

```ts
identity("who am I?");
```

Разница в том, что при не передаче `TS` будет сам вычислять тип и в более сложных случаях это может привести к ошибкам в типах, поэтому нужно будет ясно передавать дженерик.

Интересно то, как именно `TS` вычисляет тип для конкретного дженерика. Для это рассмотрим функцию `mapArray`, которая принимает массив и функцию, которая берёт элемент из этого массива и возвращает новое значение. Её нужно типизировать

```js
const mapArray = (array, callback) => array.map(callback);

mapArray(['1', '1', '2', '3', '5'], str => parseInt(str));
mapArray([1, 1, 2, 3, 5], num => `${num}`)
```

Уже можно сказать, что нужен дженерик, который будет отвечать за элемент массива.

```ts
const mapArray = <T>(array: T[], callback: (item: T) => unknown) => array.map(callback);
```

По вызову `mapArray` можно заменить, что `callback` может возвращать отличное значение от `T`, поэтому нужен другой дженерик, например, `U`.

```ts
const mapArray = <T, U>(array: T[], callback: (item: T) => U) => array.map(callback);
```

Если вызвать эту функцию и навести на `mapArray`, то можно увидеть, что `T` превратилось в `string`, а `U` в `number`.

```ts
mapArray(['1', '1', '2', '3', '5'], str => parseInt(str));
```

>`TS` в зависимости от места использования дженерика сам вычисляет какой тип у него будет. При вычислении дженерика `T`, он догадывается, что там должна быть строка, так как `T` используется возле массива и как параметр в функции, которая принимает элемент из массива, а значит тип должен быть элементом из массива, массив из строк, поэтому `T` это строка. А с `U` он просто подставляет то, что должна вернуть функция.

Если `U` заменить на `T`, то при вызове функции ниже, `TS` вычислит `T` как строку. Что вызовет ошибку, так как функция, переданная вторым аргументом при выполнении вернёт число.

```ts
const mapArray = <T, U>(array: T[], callback: (item: T) => T) => array.map(callback);

mapArray(['1', '1', '2', '3', '5'], str => parseInt(str));
```

https://typehero.dev/challenge/generic-function-arguments
## Ограничения

В примерах выше в `CustomNode` можно передать вообще любые значения, то есть:

```ts
type WrongNode1 = CustomNode<5, "aaa">;
type WrongNode2 = CustomNode<true, () => {}>;
type WrongNode3 = CustomNode<{}, null>;
```

А нам нужно, чтобы `type` был строкой, причём вполне конкретной строкой, то есть литералом, а `data` объектом. Для создания ограничений можно использовать `extends`. В ограничения также можно передавать объединения `T extends U | R`.

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

https://typehero.dev/challenge/generic-type-constraints

## Общий тип по умолчанию

Также, как и для аргументов в функции для общих типов можно задать тип по умолчанию.

```ts
type Log<Message, Level = "info"> = {
  message: Message;
  level: Level;
};

type ExplicitDebugLog = Log<"explicit", "debug">;
type ImplicitInfo = Log<"implicit info">;
```

Если навести курсор на `ImplicitInfo`, то в поле `level` будет виден `info`.

Любой тип будет применён как тип по умолчанию, будь то `any`, `never` или `unknown`. Это никак в `JS` с `undefined`, где его передача может значить, что либо ничего не было передано, либо передался `undefined` в качестве значения.

https://typehero.dev/challenge/default-generic-arguments