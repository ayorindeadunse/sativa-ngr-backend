const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const cryptoRandomString = require("crypto-random-string");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Codes = require("../models/codes");
const emailService = require("../utils/nodemailer");

/***
 *
 * route: GET /verification/verify-account/:userId/:secretCode
 *
 * Endpoint used to verify user's e-mail account
 *
 * public
 */

router.get(
  "/verification/verify-account/:userId/:secretCode",
  async (req, res) => {
    try {
    } catch (error) {
      //log to log app
      console.log(
        "Server error from /api/activateUser/verification/verify-account: ",
        error
      );
      res
        .status(500)
        .send(
          "An error occurred on the server at /api/activateUser/verification/verify-account - ",
          error
        );
    }
  }
);
