## Типы данных

### Примитивы

- `number`, так как `JS` имеет только один тип для всех чисел, то `TS` также имеет только один тип, обозначающих число;
- `string`, строка переменной длины;
- `boolean`, [[Basic#Union (объединение)|объединение]] из `false` и `true`;
- `null`, собственно `null`;
- `undefined`, собственно `undefined`.

TODO: Написать про `symbol, bigint, object, never, unknown, any`.

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
## Union (объединение)

`Union (объединение)` - набор из возможных значений, которое может принимать тип. Объединение возвращает [[Basic#Оператор `keyof`|keyof]]. Значения разделяются при помощи `|`.

```ts
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
```

Некоторые свойства об объединениях:

1. Они не упорядочены, поэтому не стоит полагаться на их порядок, в разных версиях `TS` один и тот же `union` может быть в разном порядке;
2. Они содержат только уникальные значения, то есть `union` `1 | 1 | 2 | 3` это тот же, что и `1 | 2 | 3`;
3. Тип `never`, означает, что `union` не имеет в себе элементов, следовательно пуст.

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