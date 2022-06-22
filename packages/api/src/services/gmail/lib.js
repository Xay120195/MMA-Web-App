const AWS = require("aws-sdk");
const axios = require("axios");

AWS.config.update({ region: "ap-southeast-1" });

exports.docClient = new AWS.DynamoDB.DocumentClient();

exports.refreshTokens = (payload) =>
  axios.post(
    "https://accounts.google.com/o/oauth2/token?grant_type=refresh_token",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );


const axiosConf = axios.create({
  baseURL: "https://gmail.googleapis.com/",
  headers: { "Content-Type": "application/json" },
});

exports.gmailAxios = axiosConf;

exports.setAccessToken = (access_token) =>
  (axiosConf.defaults.headers["Authorization"] = `Bearer ${access_token}`);


