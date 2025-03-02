---
tags:
  - react
refs:
  - https://www.advanced-react.com/
date: 2025-02-08
author: Ruslan Seit-Akaev
---
`Reconciliation (согласование)` - процесс, при котором `React` обновляет реальный браузерный `DOM`. Алгоритм позволяет обновлять `DOM` быстро.

Стоит начать с того, что `React` работает с `Virtual DOM` (виртуальное дерево), а не с реальным `DOM`, потому что работа с последним медленная, а `Virtual DOM` это легковесная  копия реального `DOM` (структура из объектов), поэтому добавлять/удалять/обновлять выходит быстро.

## Как работает алгоритм согласования

Первый раз контент рисуется на странице и реальное `DOM` и виртуальное `DOM` деревья создаются. 

Если же происходит обновление состояния, то процесс можно поделить на три фазы:

1. `Обновление состояния` - когда состояние компонента изменяется, `React` создаёт новое виртуальное дерево и фиксирует в нём изменения;
2. `Процесс сравнение` - теперь `React` сравнивает два виртуальных дерева "до обновления состояния" и "после обновления". Цель этого алгоритма понять, какие изменения произошли;
3. `Выборочное обновление` - `React` обновляет только те части реального `DOM`, которые были изменены, а не перерисовывают всю страницу целиком.

## Обновление состояния

 В `React` каждый раз, когда мы используем хуки `useState`, `useReducer`, `useContext` или внешний стейт, такой как `Redux`, компонент начинает хранить часть данных, которая будет доступна на протяжении всего жизненного цикла.

TODO: 
Добавить про `батчинг`.

## Процесс сравнение. Коротко.

Как было сказано выше есть два дерева ("до" и "после"). Дерево "после" создаётся, когда обновляется состояние компонента.

При поочерёдном сравнении элементов из двух деревьев алгоритм придерживается следующих правил:

1. Если удаляется элемент, то удаляется и все го дочерние элементы;
2. `React` смотрит на [[Элементы и компоненты#Подробнее о `type`|type]] этих элементов:
    - Если `type` у элементов не совпадает (по ссылке или по значению), то предыдущий элемент, а новый элемент;
    - Если `type` у элементов совпадает (по ссылке и значению), то к текущему элементу будет применены новые изменения (если они есть);
3. Также для сравнения `React` использует пропс [[Reconciliation#Сравнение по `key`|key]], причём он может использовать не только в списках, но и в обычных компонентах: ^17cde8
    - Если `key` отличается, то предыдущий элемент удаляется, а новый элемент добавляется;
    - ^Если `key` остаётся одинаковым, то к текущему элементу будет применены новые изменения (если они есть), и `React` просто переиспользует этот элемент. ^e243bd

> Сначала `React` смотрит на `type`, а когда `type` одинаковый `React` смотрит на `key`.

## Выборочное обновление

^Элементы сравниваются по ссылке, если ссылка одна и та же, значит этот элемент и все элементы ниже можно не трогать (ссылку на элемент можно сделать одинаковой при помощи `useMemo` [[React_deep_dive#`memo` и компонент в `children`|посмотреть]]); ^16e023

## Процесс сравнение. Подробно.

Понимание алгоритма сравнения `React` позволяет решить неочевидные баги и уменьшить количество ререндеров у компонентов. Ниже приведены примеры, подтверждающие алгоритм ниже.

### Сравнение по `type`

#### Разный `type`

В примере ниже, если в инпут ввести текст, а затем включить и выключить чекбокс, чтобы инпут появился заново, то текст пропадёт. Почему?

```jsx
const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      
      {checked ? (
        <input id="company-tax-id-number" placeholder="Enter you company ID" />
      ) : (
        <span>PlaceHolder</span>
      )}
    </>
  );
};
```

Благодаря [[Reconciliation#Процесс сравнение. Коротко.|алгоритму]] выше становится ясно, что при `checked` равным `true` должен показываться `input`, который преобразуется в:

```js
{
  type: "input",
}
```

А при `checked` равным `false` должен показываться `span`, который преобразуется в:

```js
{
  type: "span",
}
```

Поэтому при очередном вызове `useState`  идёт сравнение предыдущего `type` и следующего, а раз они разные, то предыдущий размонтируется, а следующий монтируется.

Такая же история будет и здесь.

```jsx
const Input = ({ id, placeholder }) => {
  return <input id={id} placeholder={placeholder} />;
};

const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <input id="company-tax-id-number" placeholder="Enter you company ID" />
      ) : (
        <Input
          id="person-tax-id-number"
          placeholder="Enter you personal Tax ID"
        />
      )}
    </>
  );
};
```

При `checked` равным `true`:

```js
{
  type: "input",
}
```

При `cheked` равным `false`:

```js
{
  type: Input,
}
```

`type` не совпадает, поэтому предыдущий размонтируется, следующий монтируется.

> По этой же считается плохой практикой создать компонент внутри другого компонента.

Хук `useUpdateComponentEverySecond` вызывает обновление компонента `Form` каждую секунду, каждый ререндер создаётся новый компонент `Input`, поэтому при сравнении `React` получается `{ type: Input }` и `{ type: Input }`, но ссылки на `Input` разные, поэтому один компонент он удаляет, а второй добавляет.

```jsx
const Form = () => {
  useUpdateComponentEverySecond();

  const Input = ({ id }) => {
    console.log("Rerender");

    useEffect(() => {
      console.log("Mount");

      return () => {
        console.log("Unmount");
      };
    }, []);

    return <input id="id" />;
  };

  return <Input id="id" />;
};
```

#### Одинаковый `type`

При одинаковом `type` `React` считает, что перед ним один и тот же компонент, поэтому он просто обновляет у этого компонента данные. Именно по этой причине при переключении чекбокса сохраняется вводимое значение инпута.

`type` может быть одинаковым по значению, если это два `React DOM` элемента, либо если ссылка на функцию-компонент остаётся одной и той же. Поэтому два примера ниже поведут себя одинаково, а в случае с функцией -компонентов произойдёт простое обновление

```jsx
const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <input id="company-tax-id-number" placeholder="Enter you company ID" />
      ) : (
        <input
          id="person-tax-id-number"
          placeholder="Enter you personal Tax ID"
        />
      )}
    </>
  );
};
```

Хук `useLogComponentLifeCycle` включает в себя `useEffect`, который сообщает, когда компонент монтируется или размонтируется.

```jsx
const Input = ({ id, placeholder }) => {
  useLogComponentLifeCycle();

  console.log("Render");

  return <input id={id} placeholder={placeholder} />;
};

const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <Input id="company-tax-id-number" placeholder="Enter you company ID" />
      ) : (
        <Input
          id="person-tax-id-number"
          placeholder="Enter you personal Tax ID"
        />
      )}
    </>
  );
};
```

Кстати, если нужно, чтобы при переключении сбрасывались данные внутри элемента, то можно воспользоваться двумя способами:

-  [[Reconciliation#^c94a07|Использование условной отрисовки]];
-  [[Reconciliation#Техника "Сброс состояние элемента"|Использование пропса key]].

#### Сравнение массива с элементами

В этом случае процесс не отличается от сравнение одного элемента. Если взять пример выше, то мы получим два массива.

До обновления `useState` (`checked` равный `false`):

```js
[
  {
    type: "input",
  },
  {
    type: "input",
  },
]
```

И после обновления `useState` (`checked` равный `true`):

```js
[
  {
    type: "input",
  },
  {
    type: "input",
  },
]
```

^Если переписать пример выше на два условных рендера, то поведение будет другое.  ^c94a07

```jsx
const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <input id="company-tax-id-number" placeholder="Enter you company ID" />
      ) : null}
      {checked ? null : (
        <input
          id="person-tax-id-number"
          placeholder="Enter you personal Tax ID"
        />
      )}
    </>
  );
};
```

То при `checked` равный `false` получим:

```js
[
  {
    type: "input",
  },
  {
    type: "input",
  },
  null,
]
```

А при `true`:

```js
[
  {
    type: "input",
  },
  null,
  {
    type: "input",
  },
]
```

Один из инпутов удалится, а второй добавится, поэтому и сбросятся данные, связанные с элементом.

### Сравнение по `key`

Как было сказано [[Reconciliation#Процесс сравнение. Коротко.|выше]] `React` использует `key` для понимания того, что нужно сделать с элементом.

^Если `key` у элемента до и у элемента после одинаковый, то `React` просто обновляет элемент после. `React` считает, что элемент с `key` равным `0` до и элемент с `key` равным `0` после это один и тот же элемент, поэтому данные остаются за элементом, который получил `key` равный `0`. ^0e59bc

![[Reconciliation_8.png]]

Если же `key` нет в до, но есть в после, то `React` добавляет элемент, связанный с `key`. 

![[Reconciliation_10.png]]

Если `key` есть есть в до, но нет в после, то `React` просто удали элемент, связанный с `key`.

![[Reconciliation_9.jpg]]

Основные кейсы для применения `key`:

- Для элементов в массиве;
- Для сброса состояния элемента.

##### Для элементов в массиве

^Рассмотрим подробнее как это работает. Ниже есть массив `DATA` и по нему создаётся массив из элементов `Input`. В элементе `Input` добавлены логи на монтирование и размонтирование компонента. Также в `App` есть кнопка, которая меняет порядок элементов на обратный. ^539a5d

```jsx
const DATA = [
  { id: 1, value: 1 },
  { id: 2, value: 2 },
  { id: 3, value: 3 },
];

const Input = ({ id, placeholder }) => {
  console.log("Render: ", id);

  useEffect(() => {
    console.log("Mount: ", id);

    return () => {
      console.log("Unmount: ", id);
    };
  }, []);

  return <input type="text" placeholder={placeholder} />;
};

const App = () => {
  const [data, setData] = useState(DATA);

  const toggleIsReverse = () => {
    setData([...data].reverse());
  };

  const dropFirst = () => {
    const [, ...rest] = data;

    setData(rest);
  };

  const dropLast = () => {
    const newData = [...data];

    newData.splice(data.length - 1, 1);

    setData(newData);
  };

  return (
    <>
      <button onClick={dropFirst}>Drop first</button>
      <button onClick={dropLast}>Drop last</button>
      <button onClick={toggleIsReverse}>Reverse</button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data.map(({ id, value }, index) => {
          const input = <Input key={id} id={id} placeholder={value} />;

          console.log(input.key, input.props);

          return input;
        })}
      </div>
    </>
  );
};
```

Вот так это выглядит на экране.

![[Reconciliation_1.png]]

По умолчанию, когда мы не указываем `key` `React` использует в качестве ключа индекс элемента. И этого в принципе хватает, если массив не меняется, или меняется только его порядок. Если нажать на кнопку "Reverse", то в консоли увидим `Render 3`, `Render 2`, `Render 1`.

До нажатие кнопки (изменение состояния компонента) в виртуальном дереве был такой список (`key` и `props`):

![[Reconciliation_2.png]]

После нажатия кнопки (изменение состояния компонента) в виртуальном дереве стал такой список:

![[Reconciliation_3.png]]

Как видим ключ остался тем же, ведь ключ это индекс, а пропсы поменялись, поэтому `React` просто берёт и обновляет компонент, поэтому и вызывается `console.log("Render")`. Кстати данные инпута остались там же по также из-за одинакового `key` ([[Reconciliation#^0e59bc|вспомнить]])

Если же в качестве `key` использовать `id` элемента, то до и после будут приходить разные `key`.  В консоли также увидим `Render 3`, `Render 2`, `Render 1`.

До:

![[Reconciliation_4.png]]

После:

![[Reconciliation_5.png]]

А раз приходят разные `key`, значит `React` перемещает элемент туда, куда перемещён его `key`.

Теперь посмотрим где может быть вреден `key` в качестве индекса. Если передать его в качестве `key` элементу `Input` и  нажать на "Drop first", 

То можно увидеть `Unmount 3`, и `Render 2`, `Render 3`. Почему так произошло?. До нажатия на кнопку был такой массив:

![[Reconciliation_2.png]]

После нажатия:

![[Reconciliation_6.png]]

`React` видит, что ключа `2` больше нет, поэтому он удаляет элемент, связанный с ним. Также он видит, что пропсы у ключа `0` и `1` поменялись, поэтому остальные элементы он обновляет.

Если же снова в качестве `key` использовать `id`, то  выведется `Render 2`, `Render 3` и `Unmount 1`:

До удаления:

![[Reconciliation_4.png]]

После: 

![[Reconciliation_7.png]]

Если `Input` обернуть в `memo`, то логика останется точно такой же, единственно, что уменьшится количество ререндров элементов `Input` при использования `id` значение в качестве `key`. Но если использовать в качестве `key` индекс элемента, то пропсы будут меняться, поэтому `memo` будет бесполезным.
##### Техника "Сброс состояние элемента"

Возьмём пример [[Reconciliation#Одинаковый `type`|отсюда]]. Если добавить к `input` различный `key`, то `React` насчёт считать эти элементы разными. Поэтому и текст сбросится при переключении чекбокса. 

> Но нужно быть осторожной с этой техникой, так как состояние неконтролируемого компонента сбрасывается из-за его размонтирование и монтирование другого, что для больших компонентов может быть затратным.

```jsx
const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <input
          key="company-tax-id-number"
          id="company-tax-id-number"
          placeholder="Enter you company ID"
        />
      ) : (
        <input
          key="person-tax-id-number"
          id="person-tax-id-number"
          placeholder="Enter you personal Tax ID"
        />
      )}
    </>
  );
};
```

#### Ещё пример переиспользования элемента `React` при помощи `key`

В текущем примере при переключении чекбокса один `Input` будет удалён, а второй добавлен и это уже очевидно. 

```jsx
const Input = (id) => {
  useEffect(() => {
    console.log("Mount", id);

    return () => {
      console.log("Unmount", id);
    };
  }, []);

  return <input id={id} />;
};

const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? <Input id="company-tax-id-number" /> : null}
      {!checked ? <Input id="person-tax-id-number" /> : null}
    </>
  );
};
```

Но если вместо `null` возвращать другой `Input`, причём добавить к нему `key`, то `React` просто переиспользует этот компонент.

```jsx
const Form = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <>
      <input type="checkbox" checked={checked} onChange={handleChange} />

      {checked ? (
        <Input id="company-tax-id-number" />
      ) : (
        <Input id="stable" key="stable" />
      )}
      {!checked ? (
        <Input id="person-tax-id-number" />
      ) : (
        <Input id="stable" key="stable" />
      )}
    </>
  );
};
```

![[Reconciliation_11.png]]

Это происходит [[Reconciliation#^e243bd|потому что]].

#### Смешивание динамических и статических элементов

Если взять пример [[Reconciliation#^539a5d|выше]] и добавить после динамического массива статический элемент. И удалить элемент из динамического массива, то затронет ли это статический?

```jsx
const App = () => {
  return (
    // Динамический массив из примера выше
    ...
    <Input id="secret" />
  )
}
```

На самом деле нет. `React` помещает динамический массив в отдельный массив, и поэтому изменения в нём никак не отображаются на статическом.

![[Reconciliation_12.png]]

