const getTaskLabelByItLevel = (dv, level) => {
  const element = dv.el("span", level, {
    cls: `task task_${level}`,
  });
  
  return element;
}

const utils = {
  getTaskLabelByItLevel,
};

exports.utils = utils;