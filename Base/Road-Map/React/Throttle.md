`Throttling` - техника, которая ограничивает количество вызовов функции в течение определённого периода. Техника гарантирует, что функция вызывается с контролируемой, постоянной частотой, независимо от того, как часто происходит событие, вызывающее функцию.

## Кейс использования



## Реализация 1

Можно хранить время последнего вызова `callback`. А при каждом вызове функции, которая возвращается `throttle` проверять, прошло ли достаточно времени, чтобы вызвать `callback`, ведь нам нужно вызвать не раньше `time`. Если прошло времени больше или равно `time`, то вызываем `callback` и сохраняем последнее время вызова.

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

## Реализация 2

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