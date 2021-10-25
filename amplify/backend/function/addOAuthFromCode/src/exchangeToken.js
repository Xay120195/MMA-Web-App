const fs = require("fs");
const util = require("util");
const { google } = require("googleapis");
const readFilePromise = util.promisify(fs.readFile);

const result = fs.readFileSync("credentials.json");
const credentials = JSON.parse(result);
const { client_secret, client_id } = credentials.web;
const auth = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/connect_email"
);

async function getTokensFromCode(code) {
  return auth.getToken(code);
}

async function getTokenInfo(accessToken) {
  console.log("-----TOKEN PASSED----", accessToken);
  return auth.getTokenInfo(accessToken);
}

module.exports = {
  getTokensFromCode,
  getTokenInfo,
};
