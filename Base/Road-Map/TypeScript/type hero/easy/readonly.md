---
refs:
  - https://typehero.dev/challenge/readonly
---
## Описание

Создать аналог `Readonly`, `MyReadonly<Type>` принимает `Type` и делает все его свойства на первом уровне только для чтения. `Type` может быть объединением.

```ts
interface Todo {
  title: string
  description: string
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar"
}

todo.title = "Hello" // Error: cannot reassign a readonly property
todo.description = "barFoo" // Error: cannot reassign a readonly property
```

---
## Решение 1

Перебирать объединение можyj при помощи [[Distributive types (распределение типа)#Mapped types (перебор типа)|mapped types]]. Также нужно добавить [[Mapped object types (перебор типа объект)#Модификаторы|модификатор]] `readonly`.

```ts
type MyReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key];
}

type A = {
	a: 1,
	b: 2,
};

type B = {
	c: 3,
	d: 4,
};

type C = MyReadonly<A | B>; // MyReadonly<A> | MyReadonly<B>
```