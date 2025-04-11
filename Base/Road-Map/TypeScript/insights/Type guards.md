
## Что это?

`Type guards` - функции, которые позволяют точно определить тип переменной в определённом участке кода. 

Когда `TS` не может автоматически вывести тип переменной, то можно использовать `type guard`, чтобы явно указать компилятору, какой тип у переменной в контексте определённой логики.

## Когда их использовать?

Также как и `if`, `switch`, `typeof`, `instanceof` гварды используют `narrowing` - сужение типы. Их следует использовать, если логика выведения типа достаточно сложна, а выделение проверок в отдельные функции делают проверки чище.

```ts
type Admin = {
  role: 'admin';
  permissions: string[];
}

type User = {
  role: 'user';
  username: string;
}

type Guest = {
  role: 'guest';
  guestSince: Date;
}

type Person = Admin | User | Guest;

const isAdmin = (person: Person): person is Admin => {
  return person.role === 'admin' && Array.isArray(person.permissions);
}

const isUser = (person: Person): person is User => {
  return person.role === 'user' && typeof person.username === 'string';
}

const isGuest = (person: Person): person is Guest => {
  return person.role === 'guest' && person.guestSince instanceof Date;
}

const doLogic = (person: Person) => {
  if (isAdmin(person)) {
    person // Admin
  } else if (isUser(person)) {
    person // User
  } else if (isGuest(person)) {
    person // Guest
  }
}

const person: Person = { role: 'admin', permissions: ['read', 'write'] };

doLogic(person);
```

Конечно, в продакшен коде в такой ситуации смотрели бы по `role`, но ситуации бывают разные.

## Как работает `type guard`?

Это такая же функция как и обычная, но с добавление `x is Type` туда, где можно поместить тип возвращаемого значения.

```ts
const isAdmin = (person: Person): person is Admin => {
  return person.role === 'admin' && Array.isArray(person.permissions);
}
```

^Гвард возвращает `true` или `false`, в месте вызова гварда переданный тип будет сужаться до указанного после `is`, ниже видим, что после `isAdmin(person)` `person` сузился до `Admin`. ^ddc1e2

```ts
type Admin = {
  role: 'admin';
  permissions: string[];
}

type Person = Admin

const isAdmin = (person: Person): person is Admin => {
  return person.role === 'admin' && Array.isArray(person.permissions);
}

const person: Person = { role: 'admin', permissions: ['read', 'write'] };

if (isAdmin(person)) {
  person // Admin
} else {
  person // never
}
```

### Как работает `is`?

Стоит отдельно поговорить о том, как работает `is` в данном контексте. Функция ниже будет выводить ошибку, но почему?

```ts
type Foo = {
  answer: number;
};

const isFoo = <Type extends Foo,>(x: Type): x is Foo => { // error
  return true;
};
```

[[Type guards#^ddc1e2|Как было сказано выше]] тип переменной `x`, а в данном случае это дженерик `Type` , он будет сужен до `Foo`, чтобы это могло быть, нужно убедиться, что `Foo extends Type ? true : false` возвращает `true`. 

То есть, если я хочу сузить более широкий тип (`Type`) до более конкретного (`Foo`), мне нужно убедиться, что этот самый более конкретный тип является одним из типом подмножества более широкого.

Теперь, чтобы `Foo extends Type ? true : false` вернул `true`, нужно чтобы `Foo` содержал все свойства `Type` ([[Conditional types (условные типы)#Если `T` и `U` это пользовательские типы|освежить]]), а этого `TS` доказать никак не может, поэтому и выбрасывает ошибку, ведь ограничение `Type extends Foo` говорит о том, что `Type` должен содержать все свойства `Foo`.

Давайте рассмотри на примере и будет понятно, почему `TS` выбрасывает ошибку в данном случае.

```ts
type Foo = {
  answer: number;
};

const isFoo = <Type extends Foo,>(x: Type): x is Foo => { // error
  return true;
};

const entity = {
  answer: 42,
  wrong: 2
};

const doLogic = (entity: any) => {
  if (isFoo(entity)) {
    entity.wrong // error
  }
}
```

В функции выше мы пытаемся сузить `entity` до `Foo`, предположим, что `TS` нам это разрешил и тогда `entity` внутри `if` это `Foo`, у которого нет свойства `wrong`. 

НО, с точки зрения `JS` это неправильно, почему свойство `wrong` недоступно, если гвард `isFoo` ничего с ним не делал. Если бы `Foo` содержал все свойства `entity`, то `entity` можно было безопасно сузить до `Foo` и тогда никакие свойства не потеряются, как в функции выше.