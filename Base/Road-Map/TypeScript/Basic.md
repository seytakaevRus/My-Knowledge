## Типы данных

### Примитивы

- `number`, так как `JS` имеет только один тип для всех чисел, то `TS` также имеет только один тип, обозначающих число;
- `string`, строка переменной длины;
- `boolean`, [[Basic#Union (объединение)|объединение]] из `false` и `true`;
- `null`, собственно `null`;
- `undefined`, собственно `undefined`.

TODO: Написать про `symbol, bigint, object, unknown, any`.

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

### У типов

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

https://typehero.dev/challenge/generic-type-constraints

### Общий тип по умолчанию

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

## Indexed types (получение типа по ключу)

Это бывает полезно, если есть тип массива или объекта и нужно получить тип определённого элемента.

```ts
type Cars = ['Bugatti', 'Ferarri', 'Lambo', 'Porsche', 'Toyota Corolla'];
type SecondCar = Cars[1]; // Ferarri

type Donations = {
  Bono: 15_000_000;
  'J.K. Rowling': 160_000_000;
  'Taylor Swift': 45_000_000;
  'Elton John': 600_000_000;
  'Angelina Jolie and Brad Pitt': 100_000_000;
};
type BonoDonations = Donations["Bono"]; // 15000000
```

Важно заметить, что `TS` возвращает не строку или число, а литералы.

Что интересно, если попробовать получить определённую букву по индексу в строке, но вернётся вся строка.

```ts
type Question = "Who am I";
type FirstCharacter = Question[0]; // string
```

## Indexed signatures (тип с неограниченным количеством ключей)

К примеру, бэк возвращает такой ответ, как написать для него тип?

```ts
{
  "info": {
    "count": 9001,
    "currentPage": 1,
    "pages": 22
  },
  "results": {
    "user_ddb04d2e-21ff-4c68-9bdc-135c16c8e74a": 0,
    "user_1e118b25-c0b9-4bfc-8d04-901ad8a2eb20": 3,
    "user_7c56283c-6a5e-4d79-bdd0-9c6a3cafd2c4": 15,
    "user_2eac2f5e-4f11-4d36-84b5-9d273816d6f6": 7,
    "user_4b88b4a3-8d42-4fc9-9f73-8db296d9b03d": 88,
    "user_af836d5e-16a2-452d-bec4-694d6cd8e49f": 92,
    "user_610c236f-b3bb-45e9-a09b-1d7e362c7fbb": 14,
    "user_7a8e29f0-d7b0-4b75-9ad2-c8a145073eab": 6,
    "user_eaa914df-4650-4c3b-9a04-723b5a63f297": 764,
    "user_3199b7c6-7a8d-47eb-ae94-4e3457ad7760": 32,
    // ... for many more rows in this page
  }
}
```

С полем `info` всё ясно, но что насчёт `results`? Здесь как раз и поможет индексная сигнатура.

Мы указываем, в типе `Results` будут содержаться какое-то количество записей, у которых ключ это строка, а значение это число. `userId` это всего лишь псевдоним, он может быть каким угодно.

```ts
type Results = {
  [userId: string]: number;
};
```

>Хоть и `TS` позволяет указать возле `userId` тип `boolean`, `number`, `null` и т.д. Но в действительности в объекте в качестве ключа может быть только строка или символ. Поэтому указывать в типе что-то иное кроме строки или символа бессмысленно, это будет только вводить в заблуждение.


## Mapped object types (перебор типа)

`Перебор типа` позволяет создавать новые типы через преобразование свойств текущих типов, позволяя делать код более гибким.

Начать можно с перебора, который просто перебирает тип и возвращает его копию. 

```ts
type MoviesByGenre = {
  action: 'Die Hard';
  comedy: 'Groundhog Day';
  sciFi: 'Blade Runner';
  fantasy: 'The Lord of the Rings: The Fellowship of the Ring';
  drama: 'The Shawshank Redemption';
  horror: 'The Shining';
  romance: 'Titanic';
  animation: 'Toy Story';
  thriller: 'The Silence of the Lambs';
};

type MappedMoviesByGenre = {
	[Key in keyof MoviesByGenre]: MoviesByGenre[Key];
}
```

`Key` является псевдонимом, он может быть каким угодно. `in` специальный оператор для перебора, который говорит, что `Key` представляет из себя единственное значение из массива, который указан правее этого оператора. `keyof MoviesByGenre` возвращает объединение из ключей. А `MoviesByGenre[Key]` возвращает значение

Можно добавить дженерик, чтобы можно было копировать переданный тип.

```ts
type MappedType<T> = {
	[Key in keyof T]: T[Key];
}

type MappedMoviesByGenre = MappedType<MoviesByGenre>;
```

Вместо `T[key]` может быть и другой тип, например `boolean`.

```ts
type MappedTypeWithOnlyBoolean<T> = {
	[Key in keyof T]: boolean;
}

type MappedMoviesByGenre = MappedTypeWithOnlyBoolean<MoviesByGenre>;
```

Или вообще объединение из типом, например добавить к каждому типу `undefined`.

```ts
type MappedTypeWithUndefined<T> = {
	[Key in keyof T]: T[Key] | undefined;
}

type MappedMoviesByGenre = MappedTypeWithUndefined<MoviesByGenre>;
```

