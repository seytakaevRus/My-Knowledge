---
refs:
  - https://typehero.dev/challenge/chainable-options
---
## Описание

Нужно типизировать объект, который имеет два метода:

1. `option(key, value)`, вызов этого метода расширяет тип конфигурации, добавляют туда переданную пару ключ и значение;
2. `get()`, возвращает тип конфигурации.

`key` может быть только строкой, `value` любым значением. Передача одного и того же `key` должна вызвать ошибку. И должна быть возможность вызывать `options` по цепочке, в конце будет обязательно `get`.

```ts
declare const config: Chainable;

const result = config
  .option('foo', 123)
  .option('name', 'type-challenges')
  .option('bar', { value: 'Hello World' })
  .get()

// expect the type of result to be:
interface Result {
  foo: number
  name: string
  bar: {
    value: string
  }
}
```

---
## Решение 1

Что такое `declare` и для чего оно может пригодиться, почитать [[Declare|здесь]].

Первое, о чём нужно подумать: "Как хранить тип конфигурации, чтобы `option` мог его расширять, а `get` вернуть". Для этого можно хранить дженерик, назовём его `ConfigType` у типа `Chainable`, по умолчанию он будет `{}`. 

"Как расширять этот тип?" Расширение объекта происходит через оператор `&`. Также нужно добавить дженерики `Key` и `Value` у метода `option`, чтобы можно было собирать объект, и `Key` добавить ограничение, так ключ может быть только строкой. Чтобы динамически собирать объект, можно использовать `Record<Key, Value>`. Вместо `Record` можно использовать [[Mapped object types (перебор типа объект)#^e261eb|перебор типа]].

```ts
ConfigType & {[K in Key]: Value}
```

Чтобы `option` можно было вызывать цепочкой, метод должен возвращать `Chainable` вместе с расширенным `ConfigType`, а `get` возвращает `ConfigType`.

Теперь самое интересное: "Как заставить `TS` выводить ошибку, если передаётся `Key`, который уже был?". Проверить то, что ключ уже был можно через `extends keyof ConfigType`, а чтобы сгенерировать ошибку, можно в параметр функции для `Key` добавить условие `extends keyof ConfigType ? never : Key`. В случае дублирования в `Key` передастся `never`, а `Key` должен быть строкой, потому что  мы поставили ограничение, поэтому `TS` выдаст ошибку. Вместо `never` может быть любой тип, который отличается от `string`, но распространено использовать `never`.

В тестах к задаче указано, что при вызове `option` с ключом, который уже был, его `Value` должно переписывать предшествующее `Value` с тем же ключом. Это сомнительное требование, и в реальной практике я бы так не делал, так как ошибочный вызов не должен влиять на финальный тип, но чтобы удовлетворить, можно при расширении использовать `Omit`.

```ts
type Chainable<ConfigType = {}> = {
  option<Key extends string, Value>(key: Key extends keyof ConfigType ? never : Key, value: Value): Chainable<Omit<ConfigType, Key> & Record<Key, Value>>
  get(): ConfigType
}

declare const a: Chainable

const result1 = a
  .option('foo', 123)
  .option('bar', { value: 'Hello World' })
  .option('name', 'type-challenges')
  .get() // Expected1

const result2 = a
  .option('name', 'another name')
  // @ts-expect-error
  .option('name', 'last name')
  .get() // Expected2

const result3 = a
  .option('name', 'another name')
  // @ts-expect-error
  .option('name', 123)
  .get() // Expected3

type Expected1 = {
  foo: number
  bar: {
    value: string
  }
  name: string
}

type Expected2 = {
  name: string
}

type Expected3 = {
  name: number
}
```