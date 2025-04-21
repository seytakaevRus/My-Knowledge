## Описание

Реализовать типобезопасную функцию `get`, которая принимает объект и строковый путь, и возвращает `unknown`. Строка должна подсказываться на основе структуры объекта.

---
## Решение 1

```ts
// Генерация всех возможных путей


// Пример объекта
interface Example {
  id: string;
  user: {
    name: string;
    address: {
      city: string;
    }
  };
}

// Функция get с типобезопасным путём
function get<T, P extends Path<T>>(obj: T, path: P) {}
// Примеры использования
const example: Example = {
  id: "1",
  user: {
    name: "John",
    address: { city: "London" }
  }
};

const city = get(example, "user.address.city"); // unknown, но путь подсказывается
const id = get(example, "id");                  // тоже подсказывается
```

---
## Решение 2

```ts

```