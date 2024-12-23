---
tags:
  - leetcode
  - technique
---
## Описание

`DFS (Depth-first search)` - метод исследования дерева или графа. В `DFS` ты идёшь как можно глубже по одному пути, прежде чем вернуться и попробовать другой.

`DFS` похож на прогулку по лабиринту. Ты исследуешь один путь, попадаешь в тупик, а затем возвращаешься и пробуешь другой.

---
## Виды `DFS` для бинарного дерева

Все обходы дерева ниже по сути отличаются только временем вывода значение узла, поэтому подробно будет рассмотрен только `прямой обход`.

### Прямой обход (`pre-order`)

- Выводим значение текущего узла;
- Посещаем рекурсивно левое поддерево текущего узла;
- Посещаем рекурсивно правое поддерево текущего узла.

#### Рекурсивный подход

Тут всё просто, если текущий узел равен `null`, то возвращаем пустой массив. Если же нет, то возвращаем массив, где сначала идёт текущее значение узла, затем все элементы левого поддерева, затем все элементы правого поддерева.

```typescript
const preorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  if (root === null) return [];
  
  return [
    root.value,
    ...preorderTraversal(root.left),
    ...preorderTraversal(root.right),
  ];
};
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(h)`, `h` - высота дерева, `h` может быть равна `n`.

#### Рекурсивный подход с использованием замыкания

Принцип посещения тот же, что и в предыдущем решении, только здесь используется замыкание для оптимизации. Так как мы не копируем элементы при помощи оператора `...`, а просто кладём их в `output`.

```typescript
const preorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  const output: T[] = [];

  const recursion = (root: BinaryTreeNode<T> | null) => {
    if (root === null) return;

    output.push(root.value);

    if (root.left !== null) recursion(root.left);
    if (root.right !== null) recursion(root.right);
  }

  recursion(root);

  return output;
};
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(h)`, `h` - высота дерева, `h` может быть равна `n`.

#### Итеративный подход 1

Здесь итеративный подход похож на рекурсивный, потому что в стека мы храним узлы до тех пор, пока все дети узла не будут обработаны. Как только дети узла обработаны у родителя (`prevTop`) мы удаляем ссылку у родителя на его детей, и удаляем родителя из стека. Копирование объектов через `...` нужно, чтобы не изменять оригинальное дерево. А `Map` здесь используется, чтобы знать какие уже узлы были пройдены и не заносить значения таких узлов повторно.

```typescript
const preorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  if (root === null) return [];

  const stack: BinaryTreeNode<T>[] = [{ ...root }];
  const output: T[] = [];
  const map = new Map<BinaryTreeNode<T>, boolean>();

  for (; stack.length !== 0; ) {
    const top = stack[stack.length - 1];

    if (!map.get(top)) {
      output.push(top.value);

      map.set(top, true);
    }

    if (top.left !== null) {
      stack.push({ ...top.left });
    } else if (top.right !== null) {
      stack.push({ ...top.right });
    } else {
      const prevTop = stack[stack.length - 2];

      if (prevTop === undefined) return output;

      if (prevTop.left?.value === top.value) {
        prevTop.left = null;
      } else {
        prevTop.right = null;
      }

      stack.pop();
    }
  }

  return output;
};
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(n)`, `n` - количество узлов в дереве.

#### Итеративный подход 2

Здесь же стек хранит узлы в порядке их обработки. Сначала он хранит корень, потом достаёт его и хранит, если он есть, правого ребёнка и левого ребёнка (стек имеет доступ к последнему элементу, а левый ребёнок в приоритете). Далее он обрабатывает левого ребёнка и также заносит в стек его правых детей, а потом левых, когда он закончит со всеми его детьми, то возвращаем к правому ребёнку корня. Памяти этот алгоритм использует меньше и интуитивно более понятный.

```typescript
const preorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  if (root === null) return [];

  const stack: BinaryTreeNode<T>[] = [root];
  const output: T[] = [];

  for (; stack.length !== 0; ) {
    const top = stack.pop();

    output.push(top!.value);

    if (top?.right != null) {
      stack.push(top.right);
    }

    if (top?.left != null) {
      stack.push(top.left);
    }
  }

  return output;
};
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(h)`, `h` - высота дерева.

### Симметричный обход (`in-order`)

- Посещаем рекурсивно левое поддерево текущего узла;
- Выводим значение текущего узла;
- Посещаем рекурсивно правое поддерево текущего узла.

#### Рекурсивный подход

```typescript
const inorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  if (root === null) return [];

  return [
    ...inorderTraversal(root.left),
    root.value,
    ...inorderTraversal(root.right),
  ];
}
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(h)`, `h` - высота дерева, `h` может быть равна `n`.

#### Рекурсивный подход с использованием замыкания

```typescript
const inorderTraversal = <T>(root: BinaryTreeNode<T> | null): T[] => {
  const output: T[] = [];

  if (root === null) return [];

  const recursion = (root: BinaryTreeNode<T>) => {
    if (root.left !== null) recursion(root.left);

    output.push(root.value);

    if (root.right !== null) recursion(root.right);
  }

  recursion(root);

  return output;
};
```

Сложность по времени: `O(n)`, `n` - количество узлов в дереве.

Сложность по памяти: `O(h)`, `h` - высота дерева, `h` может быть равна `n`.

#### Итеративный подход 1

#### Итеративный подход 2
### Обратный обход (`post-order`)

