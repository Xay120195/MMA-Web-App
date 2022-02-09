const randomString = () => {
  var num = "0123456789",
    sm = "abcdefghijklmnopqrstuvwxyz",
    sc = "!@#$%^&*()=-_+",
    ac = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    str = "",
    len = 3;

  for (var i = 0; i <= len; i++) {
    var randNum = Math.floor(Math.random() * num.length);
    str += num.substring(randNum, randNum + 1);
  }

  for (var j = 0; j <= len; j++) {
    var randSM = Math.floor(Math.random() * sm.length);
    str += sm.substring(randSM, randSM + 1);
  }

  for (var k = 0; k <= len; k++) {
    var randSC = Math.floor(Math.random() * sc.length);
    str += sc.substring(randSC, randSC + 1);
  }

  for (var l = 0; l <= len; l++) {
    var randAC = Math.floor(Math.random() * ac.length);
    str += ac.substring(randAC, randAC + 1);
  }

  return str
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
};

export default randomString;
