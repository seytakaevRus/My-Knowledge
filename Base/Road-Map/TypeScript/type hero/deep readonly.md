---
refs:
  - https://typehero.dev/challenge/deep-readonly
---
## Описание

Нужно написать дженерик `DeepReadonly<ObjectType>`, который делает все свойства `ObjectType` только для чтения.

```ts
type X = { 
  x: { 
    a: 1
    b: 'hi'
  }
  y: 'hey'
}

type Expected = { 
  readonly x: { 
    readonly a: 1
    readonly b: 'hi'
  }
  readonly y: 'hey' 
}

type Todo = DeepReadonly<X> // should be same as `Expected
```

---
## Решение 1

[[FAQ#`(...args any[]) => any` vs `Function`]]

```ts
type DeepReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key] extends Record<string, any>
		? Type[Key] extends (...args: any) => any
			? Type[Key]
			: DeepReadonly<Type[Key]>
		: Type[Key]
}
```