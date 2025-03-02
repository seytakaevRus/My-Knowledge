`Debouncing` - техника, которая откладывает выполнение функции до тех пор, пока с последнего выполнения не прошло определённое количество времени.

## Кейс использования

Представим, что мы создаём инпут, в котором каждое введение буквы должно показывать список из предложений, которое наиболее соответствует тому тексту, что находится в инпуте.

### Решение без `debounce`

По изменению значения в инпуте посылается запрос на бэк, который возвращает посты с подходящим `title`. Рендерится сам инпут и количество постов, чей `title` подходит.

```ts
type Post = {
  title: string;
};

const Example = () => {
  const [value, setValue] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?title_like=${value}`
      );
      const data = await response.json();

      setPosts(data);

      console.log("Fetch posts");
    };

    fetchPosts();
  }, [value]);

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);
  };

  return (
    <>
      <div>Количество подходящих постов: {posts.length}</div>
      <input type="text" value={value} onChange={onChange} />
    </>
  );
};
```

Код рабочий, но на каждый ввод текста отправляет запрос на бэк, если пользователь ищет слово из `5` букв, то на бэк отправится `5` запросов, причём нужен только последний. Поэтому здесь можно применить функцию `debounce`, которая будет откладывать отправление запроса на бэк до тех пор, пока с последнего ввода не пройдёт заданное время. В итоге вместо `5` запросов, будет лишь `1` с актуальными значениями.

### Решение без `debounce` v2

Но прежде, чем перейти к версии с функцией `debounce` можно улучшить текущий код, а именно избавиться от `useEffect`. Раз актуально значение мы получаем в `onChange`, то в нём же можно выполнять запрос на бэк за получением нужных постов, а после сеттим их в стейт.

```ts
type Post = {
  title: string;
};

const fetchPosts = async (search: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?title_like=${search}`
  );
  const data = await response.json();

  console.log("Fetch posts");

  return data;
};

const Example = () => {
  const [value, setValue] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const onChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);

    const foundPosts = await fetchPosts(target.value);

    setPosts(foundPosts);
  };

  return (
    <>
      <div>Количество подходящих постов: {posts.length}</div>
      <input type="text" value={value} onChange={onChange} />
    </>
  );
};
```

Такой подход  делает код проще для понимания, колбэк внутри `useEffect` асинхронный, а при помощи `await` мы сделали синхронное исполнение кода. Также не нужно создавать доп. функцию, чтобы использовать `await`, как это было в `useEffect`.

### Решение с `debounce`

Теперь поговорим об версии с применённой функцией `debounce`. Функция `fetchPosts` не изменилась в реализации, поэтому была убрана из примера.

Первое, что нужно понять это, что конкретно нужно откладывать, чтобы уменьшить количество запрос на бэк:

1. функцию-хендлер, которая сеттит значение из события в стейт;
2. функцию, который при вызове посылает запрос на бэк.

Если мы будем откладывать функцию-хендлер, то также будет откладываться и обновление компонента, а значит введённое значение просто не будет появляться в инпуте, поэтому нужно откладывать функцию, которая отправляет запрос.

Второе, что нужно понять, `debounce` это просто функция, в основе которой лежит концепция [[Замыкание|замыкание]], более подробно об работе этой функции будет [[Debounce#Реализация|ниже]]. Поэтому важно сохранить ссылку на функцию, которая возвращает `debounce`, иначе при каждом рендере компонента будет создаваться всё новое внутри функции `debounce`, а значит и новое замыкание.

```ts
const Example = () => {
  const [value, setValue] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const debouncedLoadPosts = useCallback(
    debounce((search: string) => {
      fetchPosts(search).then((data: Post[]) => setPosts(data));
    }, 500),
    []
  );

  const onChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);
    debouncedLoadPosts(target.value);
  };

  return (
    <>
      <div>Количество подходящих постов: {posts.length}</div>
      <input type="text" value={value} onChange={onChange} />
    </>
  );
};
```

В принципе `useCallback` можно изменить на `useRef`, так как он также сохраняет ссылку на функцию.

```ts
const Example = () => {
  const [value, setValue] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const debouncedFetchPosts = useRef(
    debounce((search: string) => {
      fetchPosts(search).then((data: Post[]) => setPosts(data));
    }, 500)
  );

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);
    debouncedFetchPosts.current(target.value);
  };

  return (
    <>
      <div>Количество подходящих постов: {posts.length}</div>
      <input type="text" value={value} onChange={onChange} />
    </>
  );
};
```

## Реализация

`debounce` возвращает новую функцию, которая при вызове очищает предыдущий `id`, если он есть, если нет, то заводит новый таймер.

```ts
type Callback = (...args: any[]) => void;

const debounce = (callback: Callback, time: number): Callback => {
  let id: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (id !== null) {
      clearTimeout(id);
    }

    id = setTimeout(() => {
      callback(...args);
    }, time);
  };
};
```