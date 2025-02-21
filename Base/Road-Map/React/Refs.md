---
tags:
  - react
refs:
  - https://www.advanced-react.com/
date: 2025-02-19
author: Ruslan Seit-Akaev
---

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

Что если у нас есть компонент `Form`, а в нём компонент `InputField`. Обработка ошибок производится в `Form` и нужно, чтобы при ошибке в `InputField` производился фокус этого инпута. 

```js
const InputField = ({ onChange }) => {
  return <input type="text" onChange={onChange} />;
};

const Form = () => {
  const [name, setName] = useState("");
  
  const onSubmitClick = () => {
    if (!name) {
      // deal with empty name
    } else {
      // submit the data here!
    }
  };
  return (
    <>
      <InputField onChange={setName} />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

Можно сделать так, через отдельный `useState`, который хранит, когда нужно сфокусировать инупут, и внутри компонента `InputField` сделать это.

```js
const InputField = ({ isInputFocused, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [isInputFocused]);

  return <input ref={inputRef} type="text" onChange={onChange} />;
};

const Form = () => {
  const [name, setName] = useState("");
  const [isInputFocused, setIsFocused] = useState(false);

  const onSubmitClick = () => {
    if (!name) {
      setIsFocused(true);
      // deal with empty name
    } else {
      // submit the data here!
    }
  };
  return (
    <>
      <InputField
        isInputFocused={isInputFocused}
        onChange={setName}
      />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

### Без `forwardRef`

Но можно сделать это проще. Прокидываем реф через пропс `inputRef`, главное назвать его по-другому.

```js
const InputField = ({ inputRef, onChange }) => {
  return <input ref={inputRef} type="text" onChange={onChange} />;
};

const Form = () => {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const onSubmitClick = () => {
    if (!name) {
      inputRef.current.focus();
      // deal with empty name
    } else {
      // submit the data here!
    }
  };
  return (
    <>
      <InputField inputRef={inputRef} onChange={setName} />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

### С `forwardRef`

 Когда были классы, можно было получить ссылку на компонент, если прокинуть в пропс `ref`, в функциональном компоненте, то получим только предупреждение `Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`

`forwardRef` принимает компонент и возвращает новый компонент. У нового компонента помимо пропсов есть доступ к рефу, прокинутому сверху.

```js
const InputField = ({ onChange }, ref) => {
  return <input ref={ref} type="text" onChange={onChange} />;
};

const InputWithRef = forwardRef(InputField);

const Form = () => {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const onSubmitClick = () => {
    if (!name) {
      console.log(inputRef);
      inputRef.current.focus();
      // deal with empty name
    } else {
      // submit the data here!
    }
  };

  return (
    <>
      <InputWithRef ref={inputRef} onChange={setName} />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

> Использовать `forwardRef` или прокидывать рефы сверху через пропсы это дело вкуса. По сути результат один и тот же.

## Управление рефом ребёнка в родителе через `useImperativeHandle`

Как мы видели [[Refs#Как правильно прокидывать `ref` от родителя к ребёнку|ранее]] можно определять реф внутри родителя и просто кидать его вниз.

Но разве так правильно, хранить реф, который использует ребёнок внутри родителя, это не его зона ответственности. Было бы здорово, иметь что-то типо `Input.focus()`. Для этого есть хук `useImperativeHandle`, который работает немного запутанно.

Первое, что нам нужно, это два рефа, один который будет работать с `input`, а второй будет работать с хуком. Хук `useImperativeHandle` принимает:

- первым аргументом идёт `ref`, через который будет производиться вызовы методы, объявленные во втором аргументе;
- вторым аргументом идёт функция, которая возвращает объект с методами, в методе можно указать взаимодействие с рефом внутри компонента, например, вызвать `inputRef.current.focus()`;
- третьим аргументом идёт массив зависимостей, которые используются в методах второго аргумента, если одна из зависимостей поменялась, то функция, которая возвращает объект с методами будет пересоздана, чтобы методы могли получить доступ к актуальным значениям.

То есть по сути, в реф, который кидается в `InputField`, а затем и в хук, вкладываются методы, определенные внутри ребёнка и родитель может вызывать эти методы.

```js
const InputField = ({ apiRef, onChange }) => {
  const inputRef = useRef(null);

  useImperativeHandle(apiRef, () => {
    return {
      focus() {
        inputRef.current.focus();
      },
    };
  });

  return <input type="text" ref={inputRef} onChange={onChange} />;
};

const Form = () => {
  const [name, setName] = useState("");
  const apiRef = useRef(null);

  const onSubmitClick = () => {
    if (!name) {
      console.log(apiRef);
      apiRef.current.focus();
    } else {
      // submit the data here!
    }
  };

  return (
    <>
      <InputField apiRef={apiRef} onChange={setName} />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

## Управление рефом ребёнка в родителе без `useImperativeHandle`

Хук `useImperativeHandle` достаточно запутанный, к счастью, можно сделать тоже самое, но без него.

```js
const InputField = ({ apiRef, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    apiRef.current = {
      focus() {
        inputRef.current.focus();
      },
    };
  }, [apiRef]);

  return (
    <input
      type="text"
      className={shouldShake ? "shake" : ""}
      ref={inputRef}
      onChange={onChange}
    />
  );
};

const Form = () => {
  const [name, setName] = useState("");
  const apiRef = useRef(null);

  const onSubmitClick = () => {
    if (!name) {
      console.log(apiRef);
      apiRef.current.focus();
    } else {
      // submit the data here!
    }
  };

  return (
    <>
      <InputField apiRef={apiRef} onChange={setName} />

      <button onClick={onSubmitClick}>Submit the form!</button>
    </>
  );
};
```

Раз реф это просто мутируемый объект, причём синхронно мутируемый, то мы можем просто в `useEffect` изменить реф, который прокидывается сверху.

