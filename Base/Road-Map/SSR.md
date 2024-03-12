
По умолчанию фрейморки (`Vue`, `React`) используют `CSR (Client Side Rendering)`.

`SPA` и `SSR` могут обмениваться как чисто `HTML` страничками, как использовать `AJAX`, так и общаться с помощью `GraphQL`. В основном отличие заключается на чьей стороне строится страничка и кто управляет роутингом.

## SPA

1. JS на стороне клиента строит страницу;
2. JS на стороне клиента управляет роутингом.

Рендеринг на клиенте стал популярен с расцветом технологии `Single Page Application (SPA)`.  Зачастую `SPA` и `PWA` использует `рендеринг на стороне клиента`.

Сервер отправляет на клиент  (браузер)  `HTML`, `JS`, `CSS`. Клиент получает их, создает страницу и отображает ее. 

Также зачастую клиент может выполнять вызовы `API`, так как некоторые данные динамические и они хранятся на сервере, в этом случае уже после получения данных клиент рендерит страницу.

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

Как видно на примере выше, отданный сервером статичный HTML — это пустая страница. Если открыть этот HTML с отключенным JS, результатом будет пустой экран с ворнингом, записанным в теге noscript.

Одним из минусов рендеринга приложения на клиенте заключается, что поисковые роботы не смогут проиндексировать веб-страницу, а это ведет у ухудшению `SEO`. Для показа страницы нужно некоторое время (создание в браузере и отрисовка), а поисковые роботы не будут ждать, пока страница будет готова, поэтому они её и не проиндексируют.

## SSR

1. JS на стороне сервера строит страницу;
2. JS на стороне клиента управляет роутингом. (TODO: прочитать)

`SSR (Server-Side Rendering)` - возможность приложения рендерить (создавать) веб-страницу на сервере, а не в браузере. Сервер отсылает уже не пустую `HTML` страничку, а наполненную чем-то. С сервера также могут приходить `CSS` и `JS` файлы, но `наполнение` происходит на сервере.

Использования `SSR` заключается в следующих преимуществах:
- `более быстрое создание контента` - это более ощутимо на медленном Инете или медленных устройствах . Разметке на стороне сервера не нужно ждать, пока весь `JS` загрузится и выполнится, чтобы отрендерить страницу, поэтому пользователь увидит полностью визуализированную страницу раньше. Кроме того, получение данных выполняет на стороне;
- `лучшее SSO` - поисковые роботы

Использование `SSR` накладывает некоторые ограничения:
- `Больше нагрузки на сервер`. Рендеринг полного приложения в Node.js будет более ресурсоемким, чем просто обслуживание статических файлов, поэтому, если ожидается большой трафик, то нужно быть готовым к соответствующей нагрузке на сервер и разумно использовать стратегии кэширования.