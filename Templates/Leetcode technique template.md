---
tags:
  - leetcode
  - technique
---
## Описание

---
## Ограничения 

---
## Преимущества

---
## Использование

```typescript

```

---
## Задачи, с применением техники

```dataviewjs
const currentFileName = dv.current().file.name;

dv.table(["Task"], dv.pages('#leetcode')
	.filter(entity => {
		const linkArray = dv.array(entity.file.outlinks.values);
		return linkArray.some(link => link.path.includes(currentFileName));
	})
	.map(entity => {
		return [entity.file.link];
	}));
```