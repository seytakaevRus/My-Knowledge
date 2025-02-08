---
tags:
  - react
date: 2025-02-08
author: Ruslan Seit-Akaev
---
## Что это?

`HOC (High-order components)` или компонент высшего порядка это компонент, который принимает в качестве аргумента компонент и возвращает новый компонент. `HOC` добавляет принимаемому компоненту какую-то логику.

До хуков `HOC` использовался широко, например, получения доступа к стору `Redux` через `connect` или получения доступа к истории через `React Router` `withRouter`.

Ниже `HOC` является `withTheme`, который принимает в себя компонент, определяет тему (в реальном мире тема могла браться из контекста), и возвращает новый компонент, которому передаётся в качестве дополнительного пропса тема. Далее вызов функции `withTheme` экспортировался как новый компонент.

```js
const withTheme = (Component) => {
  const theme = isDark ? "dark" : "light";

  return (props) => <Component {...props} theme={theme} />;
};

const Button = ({ theme }) => {
  return <button className={theme}>Button</button>;
};

export const ButtonWithTheme = withTheme(Button);
```

Но сейчас такой пример можно элегантно решить через хуки.

```js
const Button = ({ theme }) => {
  const theme = useTheme();

  return <button className={theme}>Button</button>;
};
```

## Когда использовать HOC

Хоть большинство кейсов использования `HOC` теперь можно решить при помощи хуков, есть ещё варианты, где реализация через `HOC` будет элегантнее, чем через хуки.

### Расширение колбэков

Представим, что нужно по клике на кнопку вывести какие-то логи, связанные с этим компонентом. 

```js
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

Первое, что приходит на ум, это использовать хуки в компоненте, где используется `Button` вызывать функцию логирования с нужными данными.

```js
const Component = () => {
  const log = useLog();

  const onClick = () => {
    log();
  };

  return <Button onClick={onClick}>Click here</Button>;
};
```

И это выглядит нормально, если всего есть одно или два мест. Но, что если таких мест намного больше, где по клику на кнопку должно происходить логирование?

В таком случае можно логику логирования перенести в сам компонент `Button`.

```js
const Button = ({ onClick, children }) => {
  const log = useLog();

  const handleClick = () => {
    onClick();
    log();
  };

  return <button onClick={handleClick}>{children}</button>;
};
```

И также нужно в кнопку передавать данные, которые нужно логировать

```js
const Button = ({ onClick, children, loggingData }) => {
  const log = useLog();

  const handleClick = () => {
    onClick();
    log(loggingData);
  };

  return <button onClick={handleClick}>{children}</button>;
};
```

А теперь представим, что логировать нужно не только нажатие на кнопку, но и другие нажатия, например на ссылку. Тогда нужно расширять и компонент `Link`. А это снова копировать, вставлять. Да хранить логику логирования внутри элемента кнопки или ссылки нелогично, хочется её куда-нибудь вынести.

Здесь отлично подойдёт `HOC`.

```js
const withLoggingOnClick = (Component) => {
  return (props) => {
    const onClick = () => {
      console.log("Click in withLoggingOnClick");
      props.onClick();
    };

    return <Component {...props} onClick={onClick} />;
  };
};

const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

const ButtonWithLogging = withLoggingOnClick(Button);

const App = () => {
  const handleClick = () => {
    console.log("Click in App");
  };

  return (
    <>
      <ButtonWithLogging onClick={handleClick}>Click button</ButtonWithLogging>
    </>
  );
};
```

Как это работает? В `HOC` `withLoggingOnClick` передаётся компонент, внутри `HOC` создаётся новый компонент, который возвращает принятый, также создаётся функция `onClick`, вызывающую функцию из пропсов и добавляющая логику логирования. И в компонент, возвращённый из `withLoggingOnClick` кидаются пропсы.

Если нужно, чтобы другой компонент при клике отдавал логи, то просто оборачиваем его в `HOC` и также используем.

```js
const LinkWithLogging = withLoggingOnClick(Link);
```