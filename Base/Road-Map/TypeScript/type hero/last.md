### Вывод последнего элемента из массива

Написать дженерик `Last`, который принимает тип массива и возвращает его последний элемент.

```ts
type Last<T extends any[]> = T extends [...infer Rest, infer LastItem] ? LastItem : never;
```

Ограничиваем `T`, чтобы можно было передать только массив. Далее проверяем является ли `T` массивом и при помощи `[...infer Rest, infer LastItem]` в `Rest` будет положен юнион из типов всех элементов, кроме последнего, а в `LastItem` как раз последний элемент.

Интересно, что можно сделать и без использования `infer`.

```ts
type Last<T extends any[]> = [never, ...T][T['length']];
```

Т

https://typehero.dev/challenge/last-of-array

TODO: Дописать