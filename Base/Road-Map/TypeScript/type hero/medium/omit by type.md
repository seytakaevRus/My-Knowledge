---
refs:
  - https://typehero.dev/challenge/omitbytype
---
## Описание

Нужно реализовать дженерик `OmitByType<ObjectType, TypeToDelete>`, который удаляет из `ObjectType` все ключи, у которых значение равняется `TypeToDelete`.

```ts
type OmitBoolean = OmitByType<{
  name: string
  count: number
  isReadonly: boolean
  isEnable: boolean
}, boolean> // { name: string; count: number }
```

---
## Решение 1

Если нужно удалить из типа объекта ключи, то нужно воспользоваться [[Mapped object types (перебор типа объект)#Удаление ключей|этим]].

```ts
type OmitByType<ObjectType, TypeToDelete> = {
	[Key in keyof ObjectType as ObjectType[Key] extends TypeToDelete ? never : Key]: ObjectType[Key]
};
```