`React` даёт нам очень многое, но не всё, и хоть взаимодействие с реальным `DOM` он берёт на себя, порой нам нужно получить к нему доступ. Несколько распространённых случаев:

- Руками фокусировать на элементе, когда он отрендерился, например, инпут в форме;
- Определение, когда клик произошёл снаружи компонента, к примеру, для скрытия попапа;
- Руками скролится к элементу после того, как тот появился на экране;
- Вычислять размеры и границы компонентов на экране для их корректного позиционирования, например, для тултипа.

Для доступа к реальному `DOM` элементу можно использовать и `getElementById`. Но `React` даёт намного более удобный способ сделать это.

## Что такое `Ref`?

`Ref` - мутируемый объект, который `React` сохраняет между ререндерами. Мы же помним, что ререндер это по сути вызов функции-компонента, поэтому всё, что внутри него пересоздаётся.

Здесь `data` будет пересоздаваться на каждое обновление `Component`.

```js
const Component = () => {
  const data = { id: "test" };
}
```

Как и через `useState`, так и через `useRef` мы можем сохранить значение между ререндерами. Единственное, `useRef` [[Refs#Отличие `useRef` от `useState` на примере|не вызывает]] обновление компонента при изменении.

```js
const Component = () => {
  const ref = useRef({ id: "test" });
}
```

Чтобы получить доступ к реальному элементу `DOM` нужно на него навесить `ref`. И обратиться через `ref.current`.

```js
const App = () => {
  const ref = useRef();

  return <div ref={ref}>Элемент</div>;
};
```

Как было сказано выше, мутация рефа не вызывает обновление компонента, поэтому получить доступ просто так не получится. Здесь `log` выведет `null`.

```js
const App = () => {
  const ref = useRef(null);

  console.log(ref.current)

  return <div ref={ref}>Элемент</div>;
};
```

Но если вызвать обновление компонента, то способом выше удастся получить доступ к рефу.

```js
const App = () => {
  useUpdateComponentEverySecond();

  const ref = useRef(null);

  console.log(ref.current);

  return <div ref={ref}>Элемент</div>;
};
```

Поэтому обычно используется `useEffect` или обработчики событий для доступа к `ref`.

```js
const App = () => {
  const ref = useRef(null);

  useEffect(() => {
    console.log(ref.current);
  }, []);

  return <div ref={ref}>Элемент</div>;
};
```

Ссылка на `ref` остаётся одинаковой между ререндерами, будто используется `useMemo`.

```js
const App = () => {
  useUpdateComponentEverySecond();

  const ref = useRef(null);

  console.log(isDataBeforeAndAfterEquals(ref));

  useEffect(() => {
    console.log(ref.current);
  }, []);

  return <div ref={ref}>Элемент</div>;
};
```

## Отличие `useRef` от `useState` на примере

К примеру, создаём форму регистрации. И для отправки данных нужно получить доступ к значению инпута, это можно сделать двумя способами.

Через `useRef`:

```js
const Form = () => {
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(inputRef.current);
  };

  const handleChange = (event) => {
    inputRef.current = event.target.value;
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} type="text" />
      <button type="submit">Отправить</button>
    </form>
  );
};
```

Через `useState`:

```js
const Form = () => {
  const [text, setText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(text);
  };

  const handleChange = (event) => {
    setText(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} type="text" />
      <button type="submit">Отправить</button>
    </form>
  );
};
```

Одно из главных отличий заключается в том, что `useRef` не вызывает ререндер компонента, поэтому если поместить в этот компонент `log`, то при обновлении текста в инпуте обновлении компонента не будет. Тоже самое касается и пропсов, если прокинуть реф в пропсы и изменить реф, то ререндера нижестоящего компонента не произойдёт.

Второе отличие это то, что обновление рефа синхронное. Ниже `before` отличается от `after` на одну букву.

```js
const Form = () => {
  const textRef = useRef("");

  const handleChange = (event) => {
    console.log("before: ", textRef.current);
    textRef.current = event.target.value;
    console.log("after: ", textRef.current);
  };

  return <input onChange={handleChange} type="text" />;
};
```


А обновление `useState` является асинхронным. Ниже `before` и `after` одинаковые.

```js
const Form = () => {
  const [text, setText] = useState("");

  const handleChange = (event) => {
    console.log("before: ", text);
    setText(event.target.value);
    console.log("after: ", text);
  };

  return <input onChange={handleChange} type="text" />;
};
```

## Когда можно использовать `ref`?

- Если значение не используется для обновление компонентов, сейчас или в будущем;
- Если значение не используется в качестве пропса для других компонентов, сейчас или в будущем;

Если ответ на оба этих вопроса "нет", то можно использовать `ref`.

К примеру, можно считывать количество обновлений у компонента.

```js
useEffect(() => {
  ref.current = ref.current + 1;

  console.log('Render number', ref.current);
});
```

## Как правильно прокидывать `ref` от родителя к ребёнку