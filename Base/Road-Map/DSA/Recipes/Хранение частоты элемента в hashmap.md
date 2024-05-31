TODO: Доделать заметку

```typescript
const incrementElementFrequencyInMap = <K>(map: Map<K, number>, element: K): void => {
  if (!map.has(element)) {
    map.set(element, 0);
  }

  map.set(element, map.get(element)! + 1);
}

const decrementElementFrequencyInMap = <K>(map: Map<K, number>, element: K): void => {
  map.set(element, map.get(element)! - 1);

  if (map.get(element) === 0) {
    map.delete(element);
  }
}
```