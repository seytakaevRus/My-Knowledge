TODO: Дописать пример из проекта

## 🛠 Утилита `generateTypedPath`

```ts
type RouteKey = keyof typeof routes;
type RoutePath<R extends RouteKey> = typeof routes[R]["path"];
type EnsureTrailingSlash<P extends string> = P extends `${infer _}/` ? P : `${P}/`;

type ExtractParams<Path extends string, Acc extends Record<string, string> = {}> = 
  EnsureTrailingSlash<Path> extends `${string}:${infer Param}/${infer Rest}`
    ? ExtractParams<Rest, Acc & Record<Param, string>>
    : keyof Acc extends never
      ? never
      : Acc;

export function generateTypedPath<
  Route extends RouteKey
>(
  path: Route,
  ...[parameters]: ExtractParams<RoutePath<Route>> extends never
    ? []
    : [ExtractParams<RoutePath<Route>>]
): string {
  return generatePath(path, parameters);
}
```

### Особенности

- Автоматически извлекает параметры из пути вида `"/user/:id/:tab"`
- Возвращает `never`, если параметров нет → аргумент запрещён
- Использует `...[parameters]` для условного включения второго аргумента