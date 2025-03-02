`Throttling` - техника, которая ограничивает количество вызовов функции в течение определённого периода. Техника гарантирует, что функция вызывается с контролируемой, постоянной частотой, независимо от того, как часто происходит событие, вызывающее функцию.

## Кейс использования

Предположим, при ресайзинге окна мы вычисляемn ширину и высоту графика (не сумели скинуть эту работу на `CSS`, поэтому вычисляем это при помощи `React`). Также, чтобы более приблизить кейс к реальному миру, график тяжёлый, каждый его ререндер вызывает лаги.

### Решение без `throttle`

Раз мы считаем размеры графика и график тяжёлый, то нужно логику вычисления размера графика вынести в отдельный компонент, а график прокидывать как `children`. [[React_deep_dive#Как оптимизация производительности|Тогда]] график не будет ререндериться при вычислении его новых размеров.

```tsx
const Resizable = ({ children }: PropsWithChildren) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = (event) => {
      setDimensions({
        width: event.target.innerWidth,
        height: event.target.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const width =
    dimensions.width != null ? `${dimensions.width * 0.6}px` : "auto";
  const height =
    dimensions.height != null ? `${dimensions.height * 0.6}px` : "auto";

  return (
    <div
      style={{
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};

const Graphic = () => {
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "100%",
        height: "100%",
      }}
    >
      <VerySlowComponent />
    </div>
  );
};

const App = () => {
  return (
    <Resizable>
      <Graphic />
    </Resizable>
  );
};
```

Для имитация графика в компоненте `Graphic` задаётся цвет заднего фона. В данном случае мы можем просто использовать `window.innerWidth` и `window.innerHeight` и тогда не нужно использовать `setState`, но вычисление может быть куда более сложным в реальном мире.

### Решение с `throttle`

Предыдущее решение можно улучшить, если воспользоваться функцией `throttle`, её реализация описана [[Throttle#Реализация 1|тут]] и [[Throttle#Реализация 2|тут]].

```tsx
const Resizable = ({ children }: PropsWithChildren) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const throttledResize = throttle((event) => {
      setDimensions({
        width: event.target.innerWidth,
        height: event.target.innerHeight,
      });
    }, 16.6);

    window.addEventListener("resize", throttledResize);

    return () => {
      window.removeEventListener("resize", throttledResize);
    };
  }, []);

  const width =
    dimensions.width != null ? `${dimensions.width * 0.6}px` : "auto";
  const height =
    dimensions.height != null ? `${dimensions.height * 0.6}px` : "auto";

  return (
    <div
      style={{
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};

const Graphic = () => {
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "100%",
        height: "100%",
      }}
    >
      <VerySlowComponent />
    </div>
  );
};

const App = () => {
  return (
    <Resizable>
      <Graphic />
    </Resizable>
  );
};
```

Значение `16.6` выбрано, чтобы поддерживать `60 FPS`, то есть `60` кадров в секунду. В `1` секунде `1000` миллисекунд, а значит каждый кадр должен рисоваться раз в `16.6` миллисекунд. Кстати при помощи `requestAnimationFrame` [[Event loop#Request Animation Frame (RAF)|можно посмотреть]] как часто идёт обновление кадров.
### Наглядная разница

Может показаться, что пользы нет. Мы просто вызвали `throttle` и оно как-то там работает. Но разница есть в количестве вызов функции-обработчик на событие `resize`.

```tsx
const Example = () => {
  const [countWithTrottle, setCountWithThrottle] = useState(0);
  const [countWithoutThrottle, setCountWithoutThrottle] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const throttledResize = throttle((event) => {
      setDimensions({
        width: event.target.innerWidth,
        height: event.target.innerHeight,
      });

      setCountWithThrottle((prevCount) => prevCount + 1);
    }, 16.6);

    window.addEventListener("resize", throttledResize);

    return () => {
      window.removeEventListener("resize", throttledResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setCountWithoutThrottle((prevCount) => prevCount + 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div>
        <div>Calls with throttle: {countWithTrottle}</div>
        <div>Calls without throttle: {countWithoutThrottle}</div>
      </div>
      <div
        style={{
          backgroundColor: "red",
          width: `${dimensions.width * 0.6}px`,
          height: `${dimensions.height * 0.6}px`,
        }}
      ></div>
    </>
  );
};

const App = () => {
  return <Example />;
};
```

После выполнения кода выше можно увидеть два счётчика, один подсчитывает количество вызов функции обработчика без `throttle`, а второй с `throttle`. Через некоторое время после изменения размеров окна можно заметить, что счётчики отличаются.

Видно, что количество вызов с `throttle` ниже количество вызовов без `throttle` на  `(225 - 160) / 160 = 0.40`, то есть на `40%`.

![[Throttle_1.png]]

## Реализация функции `throttle`

### Реализация 1

Можно хранить время последнего вызова `callback`. А при каждом вызове функции, которая возвращается `throttle`, проверять, прошло ли достаточно времени, чтобы вызвать `callback`, ведь нам нужно вызвать не раньше `time`. Если прошло времени больше или равно `time`, то вызываем `callback` и сохраняем последнее время вызова.

```ts
type Callback = (...args: any[]) => void;

const throttle = (callback: Callback, time: number): Callback => {
  let lastCalledTime = 0;

  return (...args: any[]) => {
    const now = Date.now();

    if (now - lastCalledTime >= time) {
      callback(...args);

      lastCalledTime = now;
    }
  };
};
```

### Реализация 2

Здесь используется флаг `shouldWait`, который отвечает за то, можно ли вызвать `callback`. Изначально флаг поставлен в `false`, поэтому первый вызов происходит и флаг ставится в `true`. А вернется флаг в `false` в `setTimeout` через время `time`. 

```ts
type Callback = (...args: any[]) => void;

const throttle = (callback: Callback, time: number): Callback => {
  let shouldWait = false;

  return (...args: any[]) => {
    if (!shouldWait) {
      callback(...args);

      shouldWait = true;

      setTimeout(() => {
        shouldWait = false;
      }, time);
    }
  };
};
```

## Реализация хука `useThrottle`

Конечно, можно использовать в `React` вызов функции `throttle`, обернутый в `useCallback`, но у такого решения есть несколько недостатков:

1. Каждый раз при вызове `throttle` его нужно оборачивать в `useCallback` с пустым массивом из зависимостей;
2. Внутри функции не получится использовать последнее значение из `state` из-за работы `useCallback`.

Хук ниже решает эти проблемы.

```ts
type Callback = (...args: any[]) => void;

export const useThrottle = (callback: Callback, time: number) => {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const throttledCallback = throttle(
    (...args: unknown[]) => ref.current(...args),
    time
  );

  return useCallback(throttledCallback, []);
};
```

Чтобы понять, как этот хук работает пойдём от обратного. Мы знаем, что ссылка на функцию, которую возвращает `throttle` должна быть одинаковой, иначе [[Замыкание|замыкание]] не сработает. Поэтому строчку с `useCallback` оставляем и для удобства возвращаемую функцию вынесем в `throttledCallback`. 

Теперь, чтобы иметь доступ к новым значениям `callback` постоянно быть новым, опять же из-за замыкания. Если посмотреть ниже, то можно увидеть, что функция внутри `useThrottle` пересоздаётся при ререндере компонента, так что `callback` имеет доступ к последним значениям.

Осталось использовать [[Замыкание#Сочетание `useCallback`, `useRef` и `useEffect` для решения кейса|связку из хуков]], чтобы это решение заработало.

Для проверки его работы есть хук `useUpdateComponentEverySecond` который каждую секунду возвращает новое число и при ресайзинге `count` постоянно новый.

```tsx
const Resizable = ({ children }: PropsWithChildren) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const count = useUpdateComponentEverySecond();

  const throttledResize = useThrottle((event) => {
    console.log(count);

    setDimensions({
      width: event.target.innerWidth,
      height: event.target.innerHeight,
    });
  }, 16.6);

  useEffect(() => {
    window.addEventListener("resize", throttledResize);

    return () => {
      window.removeEventListener("resize", throttledResize);
    };
  }, []);

  const width =
    dimensions.width != null ? `${dimensions.width * 0.6}px` : "auto";
  const height =
    dimensions.height != null ? `${dimensions.height * 0.6}px` : "auto";

  return (
    <div
      style={{
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};

const Graphic = () => {
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "100%",
        height: "100%",
      }}
    >
      <VerySlowComponent />
    </div>
  );
};

const App = () => {
  return (
    <Resizable>
      <Graphic />
    </Resizable>
  );
};
```