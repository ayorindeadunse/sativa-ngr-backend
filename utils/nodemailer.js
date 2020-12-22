const nodemailer = require("nodemailer");
const config = require("config");

/***
 *
 * separte production e-mail sending from development
 *
 * Test prod details
 * =================
 * if(process.env.NODE_ENV == "production")  // or set details in production config file
 * {
 * config = process.env
 * }
 * else
 * config = require('config') // as above
 *
 */

const emailService = nodemailer.createTransport({
  host: config.get("EMAIL_HOST"),
  port: config.get("EMAIL_PORT"),
  secure: true, // remember to set to true when test works
  auth: {
    user: config.get("EMAIL_USERNAME"),
    pass: config.get("EMAIL_PASSWORD"),
  },
});

module.exports = emailService;
