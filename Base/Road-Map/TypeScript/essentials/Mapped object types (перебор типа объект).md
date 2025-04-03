## Что такое перебор типа?

`Перебор типа` это конструкция, которая позволяет создавать новые типы через преобразование свойств текущих типов, позволяя делать код более гибким.

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

## Модификаторы

При переборе типа можно добавлять или удалять модификаторы. Всего есть два модификатор:

- `readonly` - модификатор, говорящий, что поле только для чтения;
- `?` - модификатор, говорящий, что поле опциональное.

`+` добавляет модификатор, а `-` его удаляет, использование без знака `readonly` и `?` равносильно использованию `+`.

```ts
const customObject = {
  number: 5,
  string: "435",
  array: [1, 2, 3],
  object: {},
};

type CustomObject = typeof customObject;

type MyReadonly<T> = {
  readonly [Key in keyof T]: T[Key];
};
type ReadonlyCustomObject = MyReadonly<CustomObject>;

type MyMutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};
type MutableCustomObject = MyMutable<ReadonlyCustomObject>;

type MyPartial<T> = {
  [Key in keyof T]?: T[Key];
};
type PartialCustomObject = MyPartial<CustomObject>;

type MyRequired<T> = {
  [Key in keyof T]-?: T[Key];
};
type RequiredCustomObject = MyRequired<PartialCustomObject>;
```

https://typehero.dev/challenge/readonly
https://typehero.dev/challenge/mutable

## Удаление ключей

При переборе типов есть возможность удалять это делается при помощи оператора `as`.

```ts
type MyPick<Type, Keys extends keyof Type> = {
  [Key in keyof Type as Key extends Keys ? Key : never]: Type[Key];
};

const example = {
  number: 42,
  string: "Hello",
  boolean: true,
};

type A = MyPick<typeof example, "number">; // { number: "number" }
```

1. `Keys extends keyof Type` накладывает ограничение на `Keys`, дженерик должен принимать в себя только те типы, которые являются ключами `Type`;
2. `Key in keyof Type` перебирает ключи из `Type`;
3. `as` говорит о том, что дальше будет идти инструкция, которая вернёт ключ;
4. `Key extends Keys ? Key : never`, возвращает либо сам ключ, либо `never`, и в таком случае ключ пропускается.

Если `extends` перенести из ключа в значение, то ключи бы не удалялись, просто значения у них было бы, либо оригинальным, либо `never`.

```ts
type WrongMyPick<Type, Keys extends keyof Type> = {
  [Key in keyof Type]: Key extends Keys ? Key : never;
};

const example = {
  number: 42,
  string: "Hello",
  boolean: true,
};

type A = WrongMyPick<typeof example, "number">; // { number: "number", string: never, boolean: never }
```

Интересно то, что выше `MyPick` можно реализовать проще. При переборе типа обычно пишем `in keyof Type`, который перебирает ключи из объединение, а тут мы сразу передали нужное объединение и достаём из него ключи.

```ts
type MyPick<Type, Keys extends keyof Type> = {
  [Key in Keys]: Type[Key];
};
```

https://typehero.dev/challenge/pick

Ещё можно таким образом реализовать `MyOmit`, который принимает тип и ключи из этого типа, дженерик возвращает новый тип, из которого удалены переданные ключи.

```ts
type MyOmit<Type, Keys extends keyof Type> = {
  [Key in keyof Type as Key extends Keys ? never : Key]: Type[Key];
};
```

https://typehero.dev/challenge/omit

## Изменение ключей

Также оператор `as` может использоваться для изменение ключей, например, добавить к каждому ключу `_` в начало. В `Key` может содержаться `number | string | symbol`, поэтому при помощи `Extract` `Key` приводится к строке.

```ts
type AddUnderscore<Type> = {
  [Key in keyof Type as `_${Extract<Key, string>}`]: Type[Key];
};

const example = {
  number: 42,
  string: "Hello",
  boolean: true,
};

type A = AddUnderscore<typeof example>; // { _number: number, _string: string, _boolean: boolean }
```
