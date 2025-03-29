---
refs:
  - https://typehero.dev/challenge/readonly-2
---
## Описание

Нужно реализовать дженерик `MyReadonly2<Type, Union>`, которая будет как первый параметр принимать в себя тип, а второй параметр будет объединением из ключей `Type`. Дженерик возвращает тип, у которого ключи из `Union` становятся с модификатором `readonly`. Если `Union` не передать, то дженерик сделает все ключи `Type` только для чтения.

```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

const todo: MyReadonly2<Todo, 'title' | 'description'> = {
  title: "Hey",
  description: "foobar",
  completed: false,
}

todo.title = "Hello" // error
todo.description = "barFoo" // error
todo.completed = true // OK
```
 ---
## Решение 1

Чтобы мы могли не передавать `Union` нужно использовать [[Generic (общий тип)#Общий тип по умолчанию|дженерик по умолчанию]]. А чтобы получить искомый тип нужно:

1. Получить тип, в котором все ключи из `Union` будут иметь модификатор `readonly`;
2. Получить тип, в котором отсутствуют ключи из `Union`.

Соединяем эти типы через оператор `&`.

```ts
type MyReadonly2<Type, Union extends keyof Type = keyof Type> = Omit<Type, Union> & Readonly<Pick<Type, Union>>;

interface Todo1 {
  title: string
  description?: string
  completed: boolean
};

interface Todo2 {
  readonly title: string
  description?: string
  completed: boolean
}

type A = MyReadonly2<Todo1>; // { readonly title: string, readonly description?: string, readonly completed: boolean }
type B = MyReadonly2<Todo1, 'title' | 'description'>; // { readonly title: string, readonly description?: string, completed: boolean }
type C = MyReadonly2<Todo2, 'title' | 'description'>; // { readonly title: string, readonly description?: string, completed: boolean }
type D = MyReadonly2<Todo2, 'description'>; // { readonly title: string, readonly description?: string, completed: boolean }
type E = MyReadonly2<Todo2, 'invalid'>; // error
```

---

TODO: Добавить свои реализации Omit и Readonly
## Решение 2

```ts

```