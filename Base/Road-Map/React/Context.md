---
tags:
  - react
refs:
  - https://www.advanced-react.com/
date: 2025-02-09
author: Ruslan Seit-Akaev
---
## Для чего нужен контекст?

### Проблема

Представим, что нужно сделать страницу, где будет макет из двух колонок.
В первой колонке будет сайдбар, который может открываться и скрываться по кнопке. А во второй колонке будет главная часть и галерея картинок. При закрытие сайдбара вторая колонка должна увеличиваться в размере, а галерея картинок должна показываться в три колонки, а при открытие, вторая колонка уменьшается в размерах и галерея показывается в две колонки.

![[Context_1.png]]

Так будет выглядеть компонент страницы.

```jsx
const Page = () => {
  return (
    <Layout>
      <Sidebar />
      <MainPart />
    </Layout>
  );
};
```

Примерно так `Sidebar`, где `ExpandButton` контролирует открытие и закрытие сайдбара.

```jsx
const Sidebar = () => {
  return (
    <div className="sidebar">
      <ExpandButton />
    </div>
  );
};
```

А так будет выглядеть `MainPart`, где `AdjustableColumnsBlock` это галерея, которая будет рендериться в две или три колонки.

```jsx
const MainPart = () => {
  return (
    <>
      <VerySlowComponent />
      <AnotherVerySlowComponent />
      <AdjustableColumnsBlock />
    </>
  );
};
```

Теперь в `Page` нужно хранить состояние видимости сайдбара, чтобы состояние можно было передать в другие компоненты.

```jsx
const Page = () => {
  const [isNavExpanded, setIsNavExpanded] = useState();
  
  return ...
}
```

Потом это состояние нужно передать в `Sidebar`, в `MainPart` и от туда в `AdjustableColumnsBlock`. Будет это выглядеть примерно так.

```jsx
const Page = () => {
  const [isNavExpanded, setIsNavExpanded] = useState();
  
  return (
    <Layout>
      <Sidebar
        isNavExpanded={isNavExpanded}
        toggleNav={() => setIsNavExpanded(!isNavExpanded)}
      />
      <MainPart isNavExpanded={isNavExpanded} />
    </Layout>
  );
};

const Sidebar = ({ isNavExpanded, toggleNav }) => {
  return (
    <div className="sidebar">
      <ExpandButton isExpanded={isNavExpanded} onClick={toggleNav} />
    </div>
  );
};

const MainPart = ({ isNavExpanded }) => {
  return (
    <>
      <VerySlowComponent />
      <AnotherVerySlowComponent />
      <AdjustableColumnsBlock isNavExpanded={isNavExpanded} />
    </>
  );
};
```

Это, конечно, будет работать, но есть несколько проблем:

- `Sidebar` и `MainPart` используют пропсы `isNavExpanded` и `setIsNavExpanded` для того, чтобы только их передать компонентов ниже;
- Когда изменится видимость сайдбара, то [[React_deep_dive#^5c8bb4|как мы знаем]] обновятся все компоненты, в том числе `VerySlowComponent` и `AnotherVerySlowComponent`.

И в этом случае может помочь `Context`.

### Решение

`Context` может помочь передавать напрямую значение в компонент, а не последовательно сверху вниз.

![[Context_2.png]]

Создаём компонент, где будет храниться логика по управлению видимости сайдбара. И создаём сам контекст. [[React_deep_dive#Техника "передача компонента через пропс"|Как мы помним]] при обновлении `NavExpandController` `children` не будут перерендерены.

```jsx
const NavContext = createContext({
  isNavExpanded: true,
  toggle: () => {},
});

const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const toggle = () => setIsNavExpanded(!isNavExpanded);

  const value = {
    isNavExpanded,
    toggle,
  };

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
```

Далее оборачиваем компоненты в `NavExpandController`.

```jsx
const Page = () => {
  return (
    <NavExpandController>
      <Layout>
        <Sidebar />
        <MainPart />
      </Layout>
    </NavExpandController>
  );
};
```

Получения контекст производится при помощи хука `useContext(Context)`, поэтому для удобства его можно вынести в отдельный хук.

```jsx
const useNavbarStatus = () => useContext(NavContext);
```

Вызываем этот хук в тех местах, где нужен был доступ к `isNavExpanded` и `toggle`.

```jsx
const AdjustableColumnsBlock = () => {
  const { isNavExpanded } = useNavbarStatus();

  return isNavExpanded ? (
    <div>two block items here</div>
  ) : (
    <div>three block items here</div>
  );
};

const ExpandButton = () => {
  const { isNavExpanded, toggle } = useNavbarStatus();

  return (
    <button onClick={toggle}>
      {isNavExpanded ? "collapse <" : "expand >"}
    </button>
  );
};

const Sidebar = () => {
  const { isNavExpanded } = useNavbarStatus();

  return (
    <div className="left" style={{ flexBasis: isNavExpanded ? "50%" : "20%" }}>
      {/* this one will control the expand/collapse */}
      <ExpandButton />

      <ul>
        <li>
          <a href="#">some links</a>
        </li>
      </ul>
    </div>
  );
};
```

И удаляем теперь уже лишние пропсы у компонентов `Sidebar` и `MainPart`.

Теперь при изменении видимости сайдбара обновляется только `NavExpandController` (там лежит состояние) и `Sidebar`, `ExpandButton`, `AdjustableColumnsBlock` (там используется контекст)

Но у `Context` есть свои "особенности", рассмотрим их подробнее.

## Особенности использования контекста

### Изменение `value` повлечёт ререндер всех компонентов, использующих контекст

Каждый раз, когда произойдёт обновление `NavExpandController` произойдёт и новое обновление `value`, поэтому все компоненты, который прямо или косвенно используют `useContext` будут обновлены.

```jsx
const NavContext = createContext({
  isNavExpanded: true,
  toggle: () => {},
});

const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const toggle = () => setIsNavExpanded(!isNavExpanded);

  const value = {
    isNavExpanded,
    toggle,
  };

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
```

Например, перенесём `NavExpandController` внутрь `Layout`. И добавим в него отслеживание события клика, чтобы понимать сколько раз пользователь произвёл кликов на странице.

```jsx
const Layout = ({ children }: { children: ReactNode }) => {
  const [, setClickCount] = useState(0);

  useEffect(() => {
    window.addEventListener("click", () => {
      setClickCount((prevClickCount) => prevClickCount + 1);
    });
  }, []);

  return (
    <NavExpandController>
      <div className="three-layout">{children}</div>;
    </NavExpandController>
  );
};
```

Теперь на каждый клик будет производиться обновление всех компонентов, использующих контекст.

Но этого можно избежать, если сохранять ссылку на одно и тоже `value` при помощи `useMemo`.

```jsx
const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const value = useMemo(
    () => ({
      isNavExpanded,
      toggle: () => setIsNavExpanded(!isNavExpanded),
    }),
    [isNavExpanded, setIsNavExpanded]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
```

### Уменьшение ненужных ререндеров через разделение контекста

Если создать новые методы `open` и `close`, которые не завязаны на актуальном значении состояния:

```jsx
const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const value = useMemo(
    () => ({
      isNavExpanded,
      open: () => setIsNavExpanded(true),
      close: () => setIsNavExpanded(false),
      toggle: () => setIsNavExpanded(!isNavExpanded),
    }),
    [isNavExpanded, setIsNavExpanded]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
```

И использовать в каком-то компоненте, то можно заменить, что при изменении `isNavExpanded`, этот компонент будет перерендрен. Это происходит, потому что создаётся новое `value` внутри `NavExpandController` и все компоненты, подписанные на контекст будут вызваны заново.

```jsx
const Component = () => {
  console.log("Component");

  const { open } = useNavbarStatus();

  return (
    ...
  )
};
```

Этого можно избежать через разделение контекста. Один будет отвечать за хранение информации о видимости сайдбара, а второй за хранение методов для работы с видимостью.

Создаём новый контекст и хук его использования.

```jsx
const NavApiContext = createContext({
  open: () => {},
  close: () => {},
  toggle: () => {},
});

const useNavbarApi = () => useContext(NavApiContext);
```

Добавляем его в `NavExpandController`.

```jsx
const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const data = useMemo(
    () => ({
      isNavExpanded,
    }),
    [isNavExpanded]
  );

  const api = useMemo(
    () => ({
      open: () => setIsNavExpanded(true),
      close: () => setIsNavExpanded(false),
      toggle: () => setIsNavExpanded((prevNavExpanded) => !prevNavExpanded),
    }),
    [setIsNavExpanded]
  );

  return (
    <NavDataContext.Provider value={data}>
      <NavApiContext.Provider value={api}>{children}</NavApiContext.Provider>
    </NavDataContext.Provider>
  );
};
```

Теперь компонент ниже не будет ререндериться, если мы изменим видимость сайдбара, потому что `api` в `NavExpandController` не зависит от `isNavExpanded`.

```jsx
const Component = () => {
  console.log("Component");

  const { open } = useNavbarApi();

  return <div onClick={open}>Component</div>;
};
```

#### Использование с `useReducer`

Для случаев, где больше данных и функций можно использовать `useReducer` вместо `useState`.

`useReducer` возвращает массив, где первым элементов будет стейт, а вторым функция `dispatch` (её принято называть так), через которую будет производиться изменение состояния. А принимает `useReducer` функцию `reducer`, где определяется как именно изменяется `state`, и начальное значение `state` как вторым аргументом.

```jsx
const NavExpandController = ({ children }) => {
  console.log("NavExpandController");

  const [state, dispatch] = useReducer(reducer, {
    isNavExpanded: true,
  });

  const data = useMemo(
    () => ({
      isNavExpanded: state.isNavExpanded,
    }),
    [state.isNavExpanded]
  );

  const api = useMemo(
    () => ({
      open: () => dispatch({ type: "open-sidebar" }),
      close: () => dispatch({ type: "close-sidebar" }),
      toggle: () => dispatch({ type: "toggle-sidebar" }),
    }),
    []
  );

  return (
    <NavDataContext.Provider value={data}>
      <NavApiContext.Provider value={api}>{children}</NavApiContext.Provider>
    </NavDataContext.Provider>
  );
};
```

А функция `reducer` выглядит так.

```js
const reducer = (state, action) => {
  switch (action.type) {
    case "open-sidebar":
      return { ...state, isNavExpanded: true };
    case "close-sidebar":
      return { ...state, isNavExpanded: false };
    case "toggle-sidebar":
      return { ...state, isNavExpanded: !state.isNavExpanded };
  }
};
```

Когда функций и данных, то `useReducer` делает код более чистым. Ещё одним из плюсов такого подхода является то, что `api` теперь не завязаны на `data`, всё, что касается изменений состояния находится внутри `reducer`.

### Использование части контекста без ререндера компонента при изменении value

> Сейчас такой подход вряд ли пригодится, да и выглядит сложно, поэтому лично я бы выбрал [[Context#Уменьшение ненужных ререндеров через разделение контекста|разделение контекстов]], потому что это проще и элегантнее.

Есть достаточный непростой способ сделать через [[HOC]] так, что при использовании части контекста, например, функции `open` в компоненте и при изменении `value` этот компонент не будет перерендерен.

Для этого.  Сохраняем ссылку на `open` через `useCallback`.

```jsx
const NavExpandController = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const open = useCallback(() => {
    setIsNavExpanded(true);
  }, []);

  const data = useMemo(
    () => ({
      isNavExpanded,
      open,
      close: () => setIsNavExpanded(false),
      toggle: () => setIsNavExpanded((prevNavExpanded) => !prevNavExpanded),
    }),
    [isNavExpanded, open]
  );

  return (
    <NavDataContext.Provider value={data}>{children}</NavDataContext.Provider>
  );
};
```

Создаём `HOC` `withOpen` и вызываем его.

```jsx
const withOpen = (Component) => {
  return (props) => {
    const { open } = useNavbarData();

    return <Component {...props} openNav={open} />
  }
}

const Component = withOpen(({ openNav }) => {
  console.log("Component");

  return <div onClick={openNav}>Component</div>;
});
```

В данном случае проблема остаётся той же, чтобы это исправить нужно обернуть `Component` в `memo`.

```jsx
const withOpen = (Component) => {
  const MemoComponent = memo(Component);

  return (props) => {
    const { open } = useNavbarData();

    return <MemoComponent {...props} openNav={open} />;
  };
};
```

Либо же использовать `useMemo`, но если в `Component` будут переданы какие-то пропсы сверху, то их нужно будет тоже добавить в `useMemo`, иначе `Component` не будет корректно обновлён.

```jsx
const withOpen = (Component) => {
  return (props) => {
    const { open } = useNavbarData();

    const content = useMemo(() => <Component {...props} openNav={open} />, []);

    return content;
  };
};
```

Теперь если изменять `isNavExpanded`, которое повлечёт за собой изменение `value` у `NavDataContext`, то обновление в `Component` не произойдёт, но почему это работает?

При обновлении `value` будет вызываться функция, которую возвращает `withOpen`. Поэтому без `memo` или `useMemo` передаваемый компонент будет отрендерен. 
Но при использовании `memo` компонент не ререндерится, если не изменились пропсы, инструкция `{...props}` вытаскивает все пропсы, который передаются в `Component`, а ссылка на `open` всегда одна и та же благодаря `useCallback` в `NavDataContext`.
А при использовании `useMemo` сохраняется ссылка на компонент, а если до изменения и после ссылка одна и та же, то компонент не ререндерится.