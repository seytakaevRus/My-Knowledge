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

`Key` является псевдонимом, он может быть каким угодно. `in` специальный оператор для перебора, который говорит, что `Key` представляет из себя единственное значение из массива, который указан правее этого оператора. `keyof MoviesByGenre` возвращает объединение из ключей, либо же только один ключ. А `MoviesByGenre[Key]` возвращает значение ^e261eb

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

---
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
```

Сделать тип объекта только для чтения.

```ts
type MyReadonly<T> = {
  readonly [Key in keyof T]: T[Key];
};

type ReadonlyCustomObject = MyReadonly<typeof customObject>;
```

Сделать тип объекта доступ для изменения.

```ts
type MyMutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};

type MutableCustomObject = MyMutable MyReadonly<typeof customObject>>;
```

Сделать все свойства в объекте необязательными.

```ts
type MyPartial<T> = {
  [Key in keyof T]?: T[Key];
};

type PartialCustomObject = MyPartial<typeof customObject>;
```

Сделать все свойства в объекте обязательными.

```ts
type MyRequired<T> = {
  [Key in keyof T]-?: T[Key];
};
type RequiredCustomObject = MyRequired<MyPartial<typeof customObject>>;
```

https://typehero.dev/challenge/readonly
https://typehero.dev/challenge/mutable

---
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

---
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

---
## Рекурсивный перебор типа

Иногда нужно перебрать весь объект, какую бы вложенность он не имел. К примеру, нужно написать `DeepReadonly<Type>`, который принимает `Type` и применяет модификатор `readonly` ко всем свойствам, в `Type` могут быть массивы, объекты и функции.

Нам нужно будет рекурсивно пройтись по всему объекту и для каждого свойства применить утилиту `Readonly`, но прежде нужно посмотреть, как она ведёт себя для разных типов.

```ts
type A = Readonly<() => {}>; // {}
type B = Readonly<[1, 2, 3]>; // readonly [1, 2, 3]
type C = Readonly<{
	a: 1,
	b: 2
}>; // { readonly a: 1; readonly b: 2; }
type D = Readonly<1> // 1
type E = Readonly<null>; // null
```

Утилита `Readonly` внутри реализована как `mapped types`, раз мы собираемся использовать похожий механизм, то нужно обработать функцию отдельно.

Как правильно ограничить функцию, можно глянуть [[FAQ#`(...args any[]) => any` vs `Function`|здесь]], как правильно ограничить объект, можно глянуть [[FAQ#`Object` vs `{}` vs `object` vs `Record<string, any>` vs `{ [key string] any }`|здесь]]. Дальше при помощи перебора c модификатором `readonly` мы смотрим, если перед нами объект и это не функция, то кидаем его в рекурсию, иначе возвращаем `Type[Key]`.

```ts
type DeepReadonly<Type> = {
	readonly [Key in keyof Type]: Type[Key] extends Record<string, any>
		? Type[Key] extends (...args: any[]) => any
			? Type[Key]
			: DeepReadonly<Type[Key]>
		: Type[Key];
};

type X1 = {
  a: () => 22
  b: string
  c: {
    d: boolean
    e: {
      g: {
        h: {
          i: true
          j: 'string'
        }
        k: 'hello'
      }
      l: [
        'hi',
        {
          m: ['hey']
        },
      ]
    }
  }
}

type Expected1 = {
  readonly a: () => 22
  readonly b: string
  readonly c: {
    readonly d: boolean
    readonly e: {
      readonly g: {
        readonly h: {
          readonly i: true
          readonly j: 'string'
        }
        readonly k: 'hello'
      }
      readonly l: readonly [
        'hi',
        {
          readonly m: readonly ['hey']
        },
      ]
    }
  }
}

type A = StrictEqual<DeepReadonly<X1>, Expected1> // true;
```

https://typehero.dev/challenge/deep-readonly
