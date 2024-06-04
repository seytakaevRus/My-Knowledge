const getTaskLabelByItLevel = (dv, level) => {
  const element = dv.el("span", level, {
    cls: `task task_${level}`,
  });
  
  return element;
}

const getPathFromRootToTasksFolder = () => {
  return "Base/Road-Map/DSA/Tasks";
}

const utils = {
  getTaskLabelByItLevel,
  getPathFromRootToTasksFolder,
};

exports.utils = utils;