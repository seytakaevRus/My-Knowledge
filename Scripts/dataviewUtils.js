const taskColorByLabel = {
  easy: "#46c6c2",
  medium: "#fac31d",
  hard: "#f8615c",
};

const getTaskColorByItLevel = (level) => {
  return taskColorByLabel[level];
};

const getTaskLabelByItLevel = (dv, level) => {
  const element = dv.el("span", level, {
    attr: {
      style: `color: ${getTaskColorByItLevel(level)}`,
    }
  });
  
  return element;
}

const utils = {
  // getTaskColorByItLevel,
  getTaskLabelByItLevel,
};

exports.utils = utils;