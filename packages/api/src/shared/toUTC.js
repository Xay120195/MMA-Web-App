var moment = require("moment");

const toUTC = (i) => {
  console.group("toUTC");
  console.log("Input: ", i);

  const d = new Date(i);
  console.log("new Date(): ", d);

  const s = moment.utc(d).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  console.log("moment UTC: ", s);
  console.groupEnd();
  
  return s;
};

const toLocalTime = () => {
  const d = new Date();
  const s = moment.utc(d).format("YYYY-MM-DD HH:mm:ss Z");
  console.log(s);
};

module.exports = { toUTC, toLocalTime };
