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