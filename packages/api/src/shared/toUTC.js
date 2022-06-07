var moment = require("moment");

const toUTC = (i) => {
  const d = new Date(i);
  const s = moment.utc(d).toISOString();
  return s;
};

const toLocalTime = () => {
  const d = new Date();
  const s = moment.utc(d).format("YYYY-MM-DD HH:mm:ss Z");
  console.log(s);
};

module.exports = { toUTC, toLocalTime };
