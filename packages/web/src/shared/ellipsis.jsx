const ellipsis = function (str) {
  if (str.length > 25) str = str.substring(0, 25) + "...";
  return str;
};

export default ellipsis;
