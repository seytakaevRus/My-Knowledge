TODO: Доделать заметку

```typescript
const incrementElementFrequencyInMap = <K>(element: K, map: Map<K, number>): void => {
  if (!map.has(element)) {
    map.set(element, 0);
  }

  map.set(element, map.get(element)! + 1);
}

const decrementElementFrequencyInMap = <K>(element: K, map: Map<K, number>): void => {
  map.set(element, map.get(element)! - 1);

  if (map.get(element) === 0) {
    map.delete(element);
  }
}
```