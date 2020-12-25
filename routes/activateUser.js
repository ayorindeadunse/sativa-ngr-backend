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
      // get the userid that was passed as a query string and query the database
      // with it

      const user = await User.findById(req.params.userId);
      // Get user verification code
      const response = await Codes.findOne({
        email: user.email,
        code: req.params.secretCode,
      });

      // if user does not exist
      if (!user) {
        res.status(401).send("User does not exist.");
      } else {
        // check for code expiry; if it has expired, redirect user to client component to re-initiate the code
        // generation.

        // else

        // update user status
        await User.updateOne({
          email: user.email,
          status: "Active",
        });

        // delete user code from database as it's expired
        await Codes.deleteMany({ email: user.email });

        // redirect user to verified path.
        let redirectPath;

        // check production details before redirecting
        if (process.env.NODE_ENV == "production") {
          redirectPath = `${req.protocol}://${req.get("host")}account/verified`;
        } else {
          // remember to include logic to redirect user to
          //login page with token details
          redirectPath = `http://localhost:4200/`;
        }
        res.redirect(redirectPath);
      }
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

// #route:  GET /verification/get-activation-email
// #desc:   Send activation email to registered users email address
// #access: Private

router.get("/verification/get-activation-email");
module.exports = router;
