TODO: Доделать заметку

```typescript
const incrementElementFrequencyInMap = (element: string, map: Map<string, number>): void => {
  if (!map.has(element)) {
    map.set(element, 0);
  }

  map.set(element, map.get(element)! + 1);
}

const decrementElementFrequencyInMap = (element: string, map: Map<string, number>): void => {
  map.set(element, map.get(element)! - 1);

  if (map.get(element) === 0) {
    map.delete(element);
  }
}
```