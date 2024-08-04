const getTaskLabelByItLevel = (dv, level) => {
  const element = dv.el("span", level, {
    cls: `task task_${level}`,
  });

  return element;
};

const getPathFromRootToTasksFolder = () => {
  return "Base/Road-Map/DSA/Tasks";
};

const renderTasksTable = (dv, columns) => {
  const columnsMap = new Map();
  const pathToTasksFolder = getPathFromRootToTasksFolder();
  const currentFileName = dv.current().file.name;

  columns.forEach((value) => {
    columnsMap.set(value.toLowerCase(), true);
  });

  dv.table(
    columns,
    dv
      .pages(`"${pathToTasksFolder}"`)
      .filter((entity) => {
        const linkArray = dv.array(entity.file.outlinks.values);

        return linkArray.some((link) => link.path.includes(currentFileName));
      })
      .map((entity) => {
        const output = [];

        for (const [key] of columnsMap) {
          if (key === 'tasks') {
            output.push(entity.file.link);
          } else if (key === 'level') {
            output.push(getTaskLabelByItLevel(dv, entity.level));
          } else if (key === 'recommended') {
            output.push(entity.recommended ? dv.el("span", "&#9745;") : "");
          } else if (key === 'topics') {
            output.push(entity.topics);
          }
        }

        return output;
      })
  );
};

const utils = {
  getTaskLabelByItLevel,
  getPathFromRootToTasksFolder,
  renderTasksTable,
};

exports.utils = utils;
