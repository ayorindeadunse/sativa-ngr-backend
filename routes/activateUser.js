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
const authenticateTokenWhilePending = require("../middleware/checkAuthWhilePending");
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

router.get(
  "/verification/get-activation-email",
  authenticateTokenWhilePending,
  async (req, res) => {
    // get the url

    const baseUrl = req.protocol + "://" + req.get("host");

    try {
      const user = await User.findById(req.userId);

      // if user does not exist
      if (!user) {
        res.json({ success: false });
      } else {
        // delete existing secret codes tied to this email address and regenerate another.
        await Codes.deleteMany({ email: user.email });

        // create another secret code.

        const secretCode = cryptoRandomString({
          length: 6,
        });

        const newCode = new Codes({
          code: secretCode,
          email: user.email,
        });

        await newCode.save();

        const data = {
          from: `VENDOR CENTRAL<${config.get("EMAIL_USERNAME")}>`,
          to: user.email,
          subject: "Activation link for Vendor Central Registration",
          text: `Please use the following link within the next 10 minutes to activate your account on Vendor Central: ${baseUrl}/api/activateUser/verification/verify-account/${user._id}/${secretCode}`,
          html: `<p>Hi ${user.firstName},</p><p>Please use the following link within the next 10 minutes to activate your account on Vendor Central: <strong><a href="${baseUrl}/api/activateUser/verification/verify-account/${user._id}/${secretCode}" target="_blank">Activate Account</a></strong></p><br /><p>Thank You.</p><p>The Vendor Central Team.</p>`,
        };

        await emailService.sendMail(data);

        // send response to client
        res.json({ success: true });
      }
    } catch (error) {
      // log error to console
      console.log(
        "Error on /api/activateUser/verification/get-activation-email: ",
        error
      );
      res.json({ success: false });
    }
  }
);

module.exports = router;
