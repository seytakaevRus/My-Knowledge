---
tags:
  - leetcode
date: 2024-11-01
author: Ruslan Seit-Akaev
---
## Описание

`Бинарное дерево` - дерево, у которого узлы могут иметь только `0`, `1` или `2` ребёнка. И каждый ребёнок может иметь только одного родителя. Каждый узел имеет какое-то значение, ниже таким значением выступают числа.

![[DSA_Binary-Tree_1.png]]

## Виды бинарного дерева по степени заполненности

### Идеальное бинарное дерево

У такого дерева все узлы имеют `0` или `2` ребёнка. и `листья` расположены на одном уровне.

- На каждом уровне количество узлов вдвое больше, чем на предыдущем, поэтому знаю уровень можно посчитать количество узлов на нём через `2^текущий уровень`;
- Количество узлов на последнем уровне равно количеству узлов на предыдущем уровне плюс `1`.

![[DSA_Binary-Tree_2.png]]

### Полное бинарное дерево

У такого дерева каждый узел (кроме корневого узла) имеет не больше `2` детей. Заполнение такого дерева идёт слева направо.

![[DSA_Binary-Tree_3.png]]


## Бинарное дерево поиска

Из названия ясно, что это дерево используется для эффективного поиска значения.

![[DSA_Binary-Tree_4.png]]

Для `бинарного дерево поиска` есть несколько правил:

- Значение левого дочернего узла должно быть меньше, чем значение у родителя;
- Значение правого дочернего узла должно быть больше, чем значение у родителя;
- Каждый родитель имеет не больше двух детей, потому что дерево `бинарное`.

### Плюсы

- Операции поиска, добавления и удаления занимают `O(log n)`, если дерево сбалансированное;
- Динамический размер.

### Минусы

- Нет операций за `O(1)`;
- Если дерево несбалансированное, что поиск, добавление и удаление занимает `O(n)`.

### Сбалансированное бинарное дерево поиска

`Сбалансированным` деревом является тогда, когда высота детей каждого из его узлов отличается не больше, чем на `1`.

`Высота дерева` - максимальной длины путь, который нужно пройти от корня до нижнего узла.

`Высота узла` - максимальной длины путь, который нужно пройти от текущего узла до нижнего узла. Текущий узел также учитывается в подсчёте, поэтому у тех узлов, кто не имеет детей, высота будет равна `1`.

Рассмотри на примере ниже. У узла со значением `1` высота будет равна `4`, потому что максимальной длины путь равняется `1->2->3->4`. У левого ребёнка со значением `2` высота будет равняться `3`, потому что максимальной длины путь равняется `2->3->4`, а вот у правого ребёнка со значением `2` высота будет равняться `1`. Так как `3 - 1 === 2`, а `2 > 1`, то дерево ниже не является сбалансированным.

![[DSA_Binary-Tree_5.png]]