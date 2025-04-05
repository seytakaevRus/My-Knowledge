## Ограничение на приём только функций

Либо `extends (...args: any[]) => any`, либо вместо `any` указывать конкретный тип (`number`, `string` и т.д.)

```ts
type OnlyFunction<FunctionType extends (...args: any[]) => any> = FunctionType;

type A = OnlyFunction<() => {}>;

const test = (callback: (...args: number[]) => number) => {
  callback();
}

const sum = (a: number, b: number) => a + b;

test(sum);
```

> НО, не использовать `Function`, так как для функций это ещё хуже, чем `any`, мы не можем контролировать ни параметры, ни возвращаемый тип.

```ts
type OnlyFunction<FunctionType extends Function> = FunctionType; // так не делать!
```

## Ограничение на приём только объектов

## Как перебрать массив?

## Как перебрать объект (поверхностно и рекурсивно)?

## Как отфильтровать объединение?

