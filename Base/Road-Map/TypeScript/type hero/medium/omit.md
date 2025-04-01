---
refs:
  - https://typehero.dev/challenge/omit
---
## Описание

Написать аналог дженерика `Omit<Type, Union>`.

---
## Решение 1

Здесь нужно воспользоваться [[Mapped object types (перебор типа)#Удаление ключей|удалением ключей при переборе типа]].

```ts
type MyOmit<Type, Union extends keyof Type> = {
	[Key in keyof Type as Key extends Union ? never : Key]: Type[Key];
}

interface Todo {
  title: string
  description: string
  completed: boolean
}

interface Todo1 {
  readonly title: string
  description: string
  completed: boolean
}

type A = MyOmit<Todo, 'description'>; // { title: string, completed: boolean }
type B = MyOmit<Todo, 'description' | 'completed'>; // { title: string }
type C = MyOmit<Todo1, 'description' | 'completed'>; // { readonly title: string; }
```