Это бывает полезно, если есть тип массива или объекта и нужно получить тип определённого элемента.

```ts
type Cars = ['Bugatti', 'Ferarri', 'Lambo', 'Porsche', 'Toyota Corolla'];
type SecondCar = Cars[1]; // Ferarri

type Donations = {
  Bono: 15_000_000;
  'J.K. Rowling': 160_000_000;
  'Taylor Swift': 45_000_000;
  'Elton John': 600_000_000;
  'Angelina Jolie and Brad Pitt': 100_000_000;
};
type BonoDonations = Donations["Bono"]; // 15000000
```

Важно заметить, что `TS` возвращает не строку или число, а литералы.

Что интересно, если попробовать получить определённую букву по индексу в строке, но вернётся вся строка.

```ts
type Question = "Who am I";
type FirstCharacter = Question[0]; // string
```