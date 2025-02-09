---
tags:
  - react
date: 2025-02-09
author: Ruslan Seit-Akaev
---
## Для чего нужен контекст?

### Проблема

Представим, что нужно сделать страницу, где будет макет из двух колонок.
В первой колонке будет сайдбар, который может открываться и скрываться по кнопке. А во второй колонке будет главная часть и галерея картинок. При закрытие сайдбара вторая колонка должна увеличиваться в размере, а галерея картинок должна показываться в три колонки, а при открытие, вторая колонка уменьшается в размерах и галерея показывается в две колонки.

![[Context_1.png]]

Так будет выглядеть компонент страницы.

```js
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

```js
const Sidebar = () => {
  return (
    <div className="sidebar">
      <ExpandButton />
    </div>
  );
};
```

А так будет выглядеть `MainPart`, где `AdjustableColumnsBlock` это галерея, которая будет рендериться в две или три колонки.

```js
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

```js
const Page = () => {
  const [isNavExpanded, setIsNavExpanded] = useState();
  
  return ...
}
```

Потом это состояние нужно передать в `Sidebar`, в `MainPart` и от туда в `AdjustableColumnsBlock`. Будет это выглядеть примерно так.

```js
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

```js
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

```js
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

```js
const useNavbarStatus = () => useContext(NavContext);
```

Вызываем этот хук в тех местах, где нужен был доступ к `isNavExpanded` и `toggle`.

```js
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

```js
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

```js
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

```js
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

```js
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

```js
const Component = () => {
  console.log("Component");

  const { open } = useNavbarStatus();

  return (
    ...
  )
};
```

Этого можно избежать через разделение контекста. Один будет отвечать за хранение информации о видимости сайдбара, а второй за хранение методов для работы с ним.

